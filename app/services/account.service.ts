import { Injectable } from "@angular/core";
import { RequestOptions, URLSearchParams } from "@angular/http";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { AccountKeys, AccountResource, Subscription } from "app/models";
import { Constants, log } from "app/utils";
import { AzureHttpService } from "./azure-http.service";
import {
    DataCache, DataCacheTracker,
} from "./core";
import { SubscriptionService } from "./subscription.service";

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
    const regex = /subscriptions\/(.*)\/resourceGroups/;
    const out = regex.exec(accountId);

    if (!out || out.length < 2) {
        return null;
    } else {
        return out[1];
    }
}

@Injectable()
export class AccountService {
    public accountLoaded: Observable<boolean>;

    /**
     * @returns the current account.
     * If the current loaded account match the currentAccountId it will return immediately
     * otherwise this will wait for the account with currentAccountId to be loaded
     */
    public currentAccount: Observable<AccountResource>;

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
                localStorage.setItem(Constants.localStorageKey.selectedAccountId, account.id);
                this.validateCurrentAccount();
            } else {
                this._currentAccountValid.next(AccountStatus.Invalid);
            }
        });

        this.currentAccountId = this._currentAccountId.asObservable();

        this.currentAccount = this._currentAccountId.flatMap((id) => {
            return this._currentAccount
                .filter(x => x && id && x.account && x.account.id.toLowerCase() === id.toLowerCase())
                .first()
                .map(x => x && x.account);
        });
    }

    public get accountFavorites(): Observable<List<AccountResource>> {
        return this._accountFavorites.asObservable();
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return this._currentAccountValid.asObservable();
    }

    public selectAccount(accountId: string) {
        const current = this._currentAccountId.value;
        if (current === accountId) {
            return;
        }
        this._currentAccountId.next(accountId);
        this._currentAccountValid.next(AccountStatus.Loading);
        const accountObs = this.getAccount(accountId);
        const keyObs = this.getAccountKeys(accountId);
        DataCacheTracker.clearAllCaches(this._accountCache);
        Observable.forkJoin(accountObs, keyObs).subscribe({
            next: ([account, keys]) => {
                this._currentAccount.next({ account, keys });
                if (!this._accountLoaded.getValue()) {
                    this._accountLoaded.next(true);
                }
                this._currentAccountValid.next(AccountStatus.Valid);
            },
            error: (error) => {
                log.error(`Error loading account ${accountId}`, error);
                this._currentAccountValid.next(AccountStatus.Invalid);
            },
        });
    }

    public list(subscriptionId: string): Observable<List<Account>> {
        const search = new URLSearchParams();
        search.set("$filter", "resourceType eq 'Microsoft.Batch/batchAccounts'");
        const options = new RequestOptions({ search });

        return this.subscriptionService.get(subscriptionId)
            .flatMap((subscription) => {
                return this.azure.get(subscription, `/subscriptions/${subscriptionId}/resources`, options)
                    .map(response => {
                        return List(response.json().value.map((data) => {
                            return new AccountResource(Object.assign({}, data, { subscription }));
                        }));
                    });
            })
            .share();
    }

    public getAccount(accountId: string): Observable<AccountResource> {
        return this.subscriptionService.get(getSubscriptionIdFromAccountId(accountId))
            .flatMap((subscription) => {
                return this.azure.get(subscription, accountId)
                    .map(response => {
                        const data = response.json();
                        return this._createAccount(subscription, data);
                    });
            })
            .share();
    }

    public getNameFromAccountId(accountId: string): string {
        const regex = /batchAccounts\/(.*)/;
        const out = regex.exec(accountId);

        if (!out || out.length < 2) {
            return null;
        } else {
            return out[1];
        }
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
        this.getAccount(accountId).subscribe({
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
        const selectedAccountId = localStorage.getItem(Constants.localStorageKey.selectedAccountId);
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

    private _createAccount(subscription: Subscription, data: any): AccountResource {
        return new AccountResource(Object.assign({}, data, { subscription }));
    }
}
