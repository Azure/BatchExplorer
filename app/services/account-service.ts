import { ApplicationRef, Injectable, NgZone } from "@angular/core";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { AccountKeys, AccountResource, NodeAgentSku } from "app/models";
import BatchClient from "../api/batch/batch-client";
import { AzureHttpService } from "./azure-http.service";
import { SubscriptionService } from "./subscription.service";

import {
    DataCache, DataCacheTracker, RxArmEntityProxy, RxArmListProxy, RxBatchListProxy,
    RxEntityProxy, RxListProxy, getOnceProxy,
} from "./core";

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

@Injectable()
export class AccountService {
    public accountLoaded: Observable<boolean>;

    private accountJsonFileName: string = "account-favorites";

    private _accountFavorites: BehaviorSubject<List<AccountResource>> = new BehaviorSubject(List([]));
    private _currentAccount: BehaviorSubject<SelectedAccount> = new BehaviorSubject(null);
    private _currentAccountValid: BehaviorSubject<AccountStatus> = new BehaviorSubject(AccountStatus.Invalid);
    private _accountLoaded = new BehaviorSubject<boolean>(false);
    private _accountCache = new DataCache<AccountResource>();

    private _cache = new DataCache<any>();

    constructor(
        private applicationRef: ApplicationRef,
        private zone: NgZone,
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {

        this.accountLoaded = this._accountLoaded.asObservable();
        this._accountLoaded.next(true);

        this._currentAccount.subscribe((selection) => {
            if (selection) {
                const {account, keys} = selection;
                localStorage.setItem(lastSelectedAccountStorageKey, account.id);
                BatchClient.setOptions({
                    account: account.name,
                    key: keys.primary,
                    url: "https://" + account.properties.accountEndpoint,
                });
                this.validateCurrentAccount();
                this.applicationRef.tick();
            } else {
                this._currentAccountValid.next(AccountStatus.Invalid);
            }
        });
    }

    public get accountFavorites(): Observable<List<AccountResource>> {
        return this._accountFavorites.asObservable();
    }

    public get currentAccount(): Observable<AccountResource> {
        return this._currentAccount.map(x => x && x.account);
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return this._currentAccountValid.asObservable();
    }

    public selectAccount(accountId: string) {
        const current = this._currentAccount.getValue();
        if (current && current.account.id === accountId) {
            return;
        }
        const accountObs = this.getOnce(accountId);
        const keyObs = this.getAccountKeys(accountId);
        DataCacheTracker.clearAllCaches(this._accountCache, this.subscriptionService.cache);
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
        });
    }

    public getAccount(accountId: string): RxEntityProxy<AccountParams, AccountResource> {
        return new RxArmEntityProxy<AccountParams, AccountResource>(AccountResource, this.azure, {
            cache: () => this._accountCache,
            uri: ({id}) => `${id}`,
            initialParams: { id: accountId },
        });
    }

    public getOnce(accountId: string) {
        return getOnceProxy(this.getAccount(accountId));
    }

    public getAccountKeys(accountId: string): Observable<AccountKeys> {
        return this.azure.post(`${accountId}/listKeys`).map(response => new AccountKeys(response.json()));
    }

    public listNodeAgentSkus(initialOptions: any): RxListProxy<{}, NodeAgentSku> {
        return new RxBatchListProxy<{}, NodeAgentSku>(NodeAgentSku, {
            cache: (params) => this._cache,
            proxyConstructor: (params, options) => BatchClient.account.listNodeAgentSkus(options),
            initialOptions,
        });
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
        this._currentAccountValid.next(AccountStatus.Loading);

        // Try to list pools from an account(need to get at least 1 pool)
        BatchClient.pool.list({ maxResults: 1 }).fetchNext().then(() => {
            this._currentAccountValid.next(AccountStatus.Valid);
        }).catch((error) => {
            const {account: {name, properties}} = this._currentAccount.getValue();
            console.error(`Could not connect to account '${name}' at '${properties.accountEndpoint}'`, error);
            this._currentAccountValid.next(AccountStatus.Invalid);
        });
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
        storage.get(this.accountJsonFileName, (error, data) => {
            if (error) {
                console.error("Error retrieving accounts");
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
        storage.set(this.accountJsonFileName, accounts.toJS(), (error) => {
            if (error) {
                console.error("Error saving accounts", error);
                sub.error(error);
            }
            sub.next(true);
            sub.complete();
        });
        return sub;
    }
}
