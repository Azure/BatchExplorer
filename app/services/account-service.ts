import { Injectable, NgZone } from "@angular/core";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { Account, AccountResource, NodeAgentSku } from "app/models";
import { SecureUtils } from "app/utils";
import BatchClient from "../api/batch/batch-client";
import { AzureHttpService } from "./azure-http.service";
import { DataCache, DataCacheTracker, RxArmListProxy, RxBatchListProxy, RxListProxy, TargetedDataCache } from "./core";

const lastSelectedAccountStorageKey = "last-account-selected-name";

export enum AccountStatus {
    Valid,
    Invalid,
    Loading,
}
export interface AccountListParams {
    subscriptionId: string;
}

@Injectable()
export class AccountService {
    public accountLoaded: Observable<boolean>;

    private accountJsonFileName: string = "accounts";

    private _accounts: BehaviorSubject<List<Account>> = new BehaviorSubject(List([]));
    private _currentAccount: BehaviorSubject<Account> = new BehaviorSubject(null);
    private _currentAccountValid: BehaviorSubject<AccountStatus> = new BehaviorSubject(AccountStatus.Invalid);
    private _accountLoaded = new BehaviorSubject<boolean>(false);
    private _accountCache = new TargetedDataCache<AccountListParams, AccountResource>({
        key: ({subscriptionId}) => subscriptionId,
    });

    private _cache = new DataCache<any>();

    constructor(private zone: NgZone, private azure: AzureHttpService) {
        this.loadInitialData();
        this.accountLoaded = this._accountLoaded.asObservable();

        this.currentAccount.subscribe((account) => {
            if (account) {
                sessionStorage.setItem(lastSelectedAccountStorageKey, account.id);
                BatchClient.setOptions({
                    account: account.name,
                    key: account.key,
                    url: account.url,
                });
                DataCacheTracker.clearAllCaches();
                this.validateCurrentAccount();
            } else {
                this._currentAccountValid.next(AccountStatus.Invalid);
            }
        });
    }

    public get accounts(): Observable<List<Account>> {
        return this._accounts.asObservable();
    }

    public get currentAccount(): Observable<Account> {
        return this._currentAccount.asObservable();
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return this._currentAccountValid.asObservable();
    }

    public selectAccount(account: Account) {
        if (this._currentAccount.getValue() !== account) {
            this._currentAccount.next(account);
        }
    }

    public getAccount(id: string) {
        return this.azure.get(id);
    }

    public list(initalSubscriptionId: string): RxListProxy<AccountListParams, AccountResource> {
        return new RxArmListProxy<AccountListParams, AccountResource>(AccountResource, this.azure, {
            cache: (params) => this._accountCache.getCache(params),
            uri: ({ subscriptionId }) => `/subscriptions/${subscriptionId}/resources`,
            initialParams: { subscriptionId: initalSubscriptionId },
            initialOptions: { filter: "resourceType eq 'Microsoft.Batch/batchAccounts'" },
        });
    }

    public listNodeAgentSkus(initialOptions: any): RxListProxy<{}, NodeAgentSku> {
        return new RxBatchListProxy<{}, NodeAgentSku>(NodeAgentSku, {
            cache: (params) => this._cache,
            proxyConstructor: (params, options) => BatchClient.account.listNodeAgentSkus(options),
            initialOptions,
        });
    }

    public add(account: Account): Observable<void> {
        account.id = SecureUtils.uuid();
        this._accounts.next(this._accounts.getValue().push(account));
        if (!this._currentAccount.getValue()) {
            this._currentAccount.next(this._accounts.getValue().first());
        }
        return this._saveAccounts();
    }

    public delete(accountId: string): Observable<void> {
        const accounts = this._accounts.getValue();
        this._accounts.next(List<Account>(accounts.filter(x => x.id !== accountId)));
        const current = this._currentAccount.getValue();
        if (current && current.id === accountId) {
            this._currentAccount.next(this._accounts.getValue().first());
        }

        return this._saveAccounts();
    }

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
            const account = this._currentAccount.getValue();
            console.error(`Could not connect to account '${account.alias}' at '${account.url}'`, error);
            this._currentAccountValid.next(AccountStatus.Invalid);
        });
    }

    private loadInitialData() {
        this._listAccounts().subscribe((accounts) => {
            this.zone.run(() => {
                accounts = this._checkAccountHaveId(accounts);
                this._accounts.next(accounts);
                const selectedAccountId = sessionStorage.getItem(lastSelectedAccountStorageKey);
                if (selectedAccountId) {
                    const account = accounts.filter(x => x.id === selectedAccountId).first();
                    if (account) {
                        this._currentAccount.next(account);
                    }
                }
                // Using the first account as default now TODO change
                if (!this._currentAccount.getValue() && accounts.size > 0) {
                    this._currentAccount.next(accounts.first());
                }
                this._accountLoaded.next(true);
            });
        });
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
