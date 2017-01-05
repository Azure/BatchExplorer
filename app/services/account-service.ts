import { Injectable, NgZone } from "@angular/core";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { Account, AccountKeys, AccountResource, NodeAgentSku } from "app/models";
import { SecureUtils } from "app/utils";
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

    private accountJsonFileName: string = "accounts";

    private _accounts: BehaviorSubject<List<Account>> = new BehaviorSubject(List([]));
    private _currentAccount: BehaviorSubject<SelectedAccount> = new BehaviorSubject(null);
    private _currentAccountValid: BehaviorSubject<AccountStatus> = new BehaviorSubject(AccountStatus.Invalid);
    private _accountLoaded = new BehaviorSubject<boolean>(false);
    private _accountCache = new DataCache<AccountResource>();

    private _cache = new DataCache<any>();

    constructor(private zone: NgZone, private azure: AzureHttpService, subscriptionService: SubscriptionService) {
        this.accountLoaded = this._accountLoaded.asObservable();
        this._accountLoaded.next(true);

        this._currentAccount.subscribe((selection) => {
            if (selection) {
                const {account, keys} = selection;
                sessionStorage.setItem(lastSelectedAccountStorageKey, account.id);
                BatchClient.setOptions({
                    account: account.name,
                    key: keys.primary,
                    url: "https://" + account.properties.accountEndpoint,
                });
                DataCacheTracker.clearAllCaches(this._accountCache, subscriptionService.cache);
                this.validateCurrentAccount();
            } else {
                this._currentAccountValid.next(AccountStatus.Invalid);
            }
        });
    }

    public get accounts(): Observable<List<Account>> {
        return this._accounts.asObservable();
    }

    public get currentAccount(): Observable<AccountResource> {
        return this._currentAccount.map(x => x && x.account);
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return this._currentAccountValid.asObservable();
    }

    public selectAccount(accountId: string) {
        console.log("===========Selecting account", accountId);
        const accountObs = this.getOnce(accountId);
        const keyObs = this.getAccountKeys(accountId);
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
            uri: ({id}) => id,
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

    // public add(account: Account): Observable<void> {
    //     account.id = SecureUtils.uuid();
    //     this._accounts.next(this._accounts.getValue().push(account));
    //     if (!this._currentAccount.getValue()) {
    //         this._currentAccount.next(this._accounts.getValue().first());
    //     }
    //     return this._saveAccounts();
    // }

    // public delete(accountId: string): Observable<void> {
    //     const accounts = this._accounts.getValue();
    //     this._accounts.next(List<Account>(accounts.filter(x => x.id !== accountId)));
    //     const current = this._currentAccount.getValue();
    //     if (current && current.id === accountId) {
    //         this._currentAccount.next(this._accounts.getValue().first());
    //     }

    //     return this._saveAccounts();
    // }

    public get(accountId: string): Observable<Account> {
        return this._listAccounts().map((accounts) => {
            const account = accounts.filter(x => x.id === accountId).first();
            if (!account) {
                throw Error("Account now found");
            }
            return account;
        });
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
        const selectedAccountId = sessionStorage.getItem(lastSelectedAccountStorageKey);
        if (selectedAccountId) {
            this.selectAccount(selectedAccountId);
        }
        // this._listAccounts().subscribe((accounts) => {
        //     this.zone.run(() => {
        //         accounts = this._checkAccountHaveId(accounts);
        //         this._accounts.next(accounts);
        //         const selectedAccountId = sessionStorage.getItem(lastSelectedAccountStorageKey);
        //         if (selectedAccountId) {
        //             const account = accounts.filter(x => x.id === selectedAccountId).first();
        //             if (account) {
        //                 this._currentAccount.next(account);
        //             }
        //         }
        //         // Using the first account as default now TODO change
        //         if (!this._currentAccount.getValue() && accounts.size > 0) {
        //             this._currentAccount.next(accounts.first());
        //         }
        //         this._accountLoaded.next(true);
        //     });
        // });
    }

    private _listAccounts(): Observable<List<Account>> {
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

    private _saveAccounts(accounts: List<Account> = null): Observable<any> {
        let sub = new AsyncSubject();

        accounts = accounts === null ? this._accounts.getValue() : accounts;
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

    /**
     * Account created before we added the Id don't have any. Just make sure we don't break.
     */
    private _checkAccountHaveId(accounts: List<Account>): List<Account> {
        const updatedAccounts = List<Account>(accounts.map((x) => {
            if (!x.id) {
                x.id = SecureUtils.uuid();
            }
            return x;
        }));
        this._saveAccounts(updatedAccounts);
        return updatedAccounts;
    }
}
