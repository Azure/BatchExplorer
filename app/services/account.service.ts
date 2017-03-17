import { Injectable } from "@angular/core";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { AccountKeys, AccountResource } from "app/models";
import { log } from "app/utils";
import { AzureHttpService } from "./azure-http.service";
import {
    DataCache, DataCacheTracker, RxArmEntityProxy, RxArmListProxy,
    RxEntityProxy, RxListProxy, getOnceProxy,
} from "./core";
import { SubscriptionService } from "./subscription.service";

const lastSelectedAccountStorageKey = "last-account-selected-name";

export enum AccountStatus {
    Valid,
    Invalid,
    Loading,
}

export interface AccountListParams {
    subscriptionId: string;
}

export interface AccountParams {
    id: string;
}

export interface SelectedAccount {
    account: AccountResource;
    keys: AccountKeys;
}


function getSubscriptionIdFromAccountId(accountId: string) {
    const regex = /subscriptions\/(.*)\//;
    const out = regex.exec(accountId);
    if (!out || out.length === 0) {
        return null;
    } else {
        return out[0];
    }
}
@Injectable()
export class AccountService {
    public accountLoaded: Observable<boolean>;

    /**
     * This represent the value of the current accountId.
     * This change value immediately after calling #selectAccount
     */
    public currentAccountId: Observable<string>;

    private _accountJsonFileName: string = "account-favorites";
    private _accountFavorites: BehaviorSubject<List<AccountResource>> = new BehaviorSubject(List([]));
    private _currentAccount: BehaviorSubject<SelectedAccount> = new BehaviorSubject(null);
    private _currentAccountValid: BehaviorSubject<AccountStatus> = new BehaviorSubject(AccountStatus.Invalid);
    private _accountLoaded = new BehaviorSubject<boolean>(false);
    private _accountCache = new DataCache<AccountResource>();
    private _currentAccountId = new BehaviorSubject<string>(null);

    constructor(
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {

        this.accountLoaded = this._accountLoaded.asObservable();
        this._accountLoaded.next(true);

        this._currentAccount.subscribe((selection) => {
            if (selection) {
                const { account } = selection;
                localStorage.setItem(lastSelectedAccountStorageKey, account.id);
                this.validateCurrentAccount();
            } else {
                this._currentAccountValid.next(AccountStatus.Invalid);
            }
        });

        this.currentAccountId = this._currentAccountId.asObservable();
    }

    public get accountFavorites(): Observable<List<AccountResource>> {
        return this._accountFavorites.asObservable();
    }

    /**
     * @returns the current account.
     * If the current loaded account match the currentAccountId it will return immediately
     * otherwise this will wait for the account with currentAccountId to be loaded
     */
    public get currentAccount(): Observable<AccountResource> {
        return this._currentAccountId.flatMap((id) => {
            return this._currentAccount
                .filter(x => x && x.account && x.account.id === id)
                .first()
                .map(x => x && x.account);
        }).share();
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return this._currentAccountValid.asObservable();
    }

    public selectAccount(accountId: string) {
        this._currentAccountValid.next(AccountStatus.Loading);
        this._currentAccountId.next(accountId);
        const current = this._currentAccount.getValue();
        if (current && current.account.id === accountId) {
            return;
        }

        const accountObs = this.getOnce(accountId);
        const keyObs = this.getAccountKeys(accountId);
        DataCacheTracker.clearAllCaches(this._accountCache);
        Observable.forkJoin(accountObs, keyObs).subscribe(([account, keys]) => {
            this._currentAccount.next({ account, keys });
            if (!this._accountLoaded.getValue()) {
                this._accountLoaded.next(true);
            }
        });
    }

    public list(initalSubscriptionId: string): RxListProxy<AccountListParams, AccountResource> {
        return new RxArmListProxy<AccountListParams, AccountResource>(AccountResource, this.azure, {
            cache: (params) => this._accountCache,
            uri: ({ subscriptionId }) => `/subscriptions/${subscriptionId}/resources`,
            initialParams: { subscriptionId: initalSubscriptionId },
            initialOptions: { filter: "resourceType eq 'Microsoft.Batch/batchAccounts'" },
            subscription: this.subscriptionService.get(initalSubscriptionId), // TODO
        });
    }

    public getAccount(accountId: string): RxEntityProxy<AccountParams, AccountResource> {
        return new RxArmEntityProxy<AccountParams, AccountResource>(AccountResource, this.azure, {
            cache: () => this._accountCache,
            uri: ({ id }) => `${id}`,
            initialParams: { id: accountId },
            subscription: this.subscriptionService.get(getSubscriptionIdFromAccountId(accountId)),
        });
    }

    public getOnce(accountId: string) {
        return getOnceProxy(this.getAccount(accountId));
    }

    public getAccountKeys(accountId: string): Observable<AccountKeys> {
        const subId = getSubscriptionIdFromAccountId(accountId);
        return this.subscriptionService.get(subId)
            .flatMap((sub) => this.azure.post(sub, `${accountId}/listKeys`))
            .map(response => new AccountKeys(response.json()))
            .share();
    }

    public favoriteAccount(accountId: string): Observable<any> {
        if (this.isAccountFavorite(accountId)) {
            return Observable.of(true);
        }

        const subject = new AsyncSubject();
        this.getOnce(accountId).subscribe({
            next: (account) => {
                this._accountFavorites.next(this._accountFavorites.getValue().push(account));
                this._saveAccountFavorites();
                subject.complete();
            }, error: (e) => {
                subject.error(e);
            },
        });

        return subject.asObservable();
    }

    public unFavoriteAccount(accountId: string) {
        accountId = accountId.toLowerCase();
        if (!this.isAccountFavorite(accountId)) {
            return;
        }

        const newAccounts = this._accountFavorites.getValue().filter(account => account.id.toLowerCase() !== accountId);
        this._accountFavorites.next(List<AccountResource>(newAccounts));
        this._saveAccountFavorites();
    }

    public isAccountFavorite(accountId: string): boolean {
        accountId = accountId.toLowerCase();
        const favorites = this._accountFavorites.getValue();
        const account = favorites.filter(x => x.id.toLowerCase() === accountId).first();

        return Boolean(account);
    }

    public validateCurrentAccount() {
        this._currentAccountValid.next(AccountStatus.Valid);
    }

    public loadInitialData() {
        const selectedAccountId = localStorage.getItem(lastSelectedAccountStorageKey);
        if (selectedAccountId) {
            this.selectAccount(selectedAccountId);
        }

        this._loadFavoriteAccounts().subscribe((accounts) => {
            this._accountFavorites.next(accounts);
            this._accountLoaded.next(true);
        });
    }

    private _loadFavoriteAccounts(): Observable<List<AccountResource>> {
        let sub = new AsyncSubject();
        storage.get(this._accountJsonFileName, (error, data) => {
            if (error) {
                log.error("Error retrieving accounts");
                sub.error(error);
            }

            if (Array.isArray(data)) {
                sub.next(List(data));
            } else {
                sub.next(List([]));
            }

            sub.complete();
        });

        return sub;
    }

    private _saveAccountFavorites(accounts: List<AccountResource> = null): Observable<any> {
        let sub = new AsyncSubject();

        accounts = accounts === null ? this._accountFavorites.getValue() : accounts;
        storage.set(this._accountJsonFileName, accounts.toJS(), (error) => {
            if (error) {
                log.error("Error saving accounts", error);
                sub.error(error);
            }

            sub.next(true);
            sub.complete();
        });

        return sub;
    }
}
