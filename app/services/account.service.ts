import { Injectable } from "@angular/core";
import { RequestOptions, URLSearchParams } from "@angular/http";
import * as storage from "electron-json-storage";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { AccountKeys, AccountResource, Subscription } from "app/models";
import { AccountPatchDto } from "app/models/dtos";
import { ArmResourceUtils, Constants, log } from "app/utils";
import { AzureHttpService } from "./azure-http.service";
import {
    DataCache, DataCacheTracker, RxBasicEntityProxy, RxEntityProxy, getOnceProxy,
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

@Injectable()
export class AccountService {
    public accountLoaded: Observable<boolean>;
    public accountsLoaded: Observable<boolean>;
    public accounts: Observable<List<AccountResource>>;

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
    private _accounts = new BehaviorSubject<List<AccountResource>>(List([]));
    private _accountsLoaded = new BehaviorSubject<boolean>(false);
    private _cache = new DataCache<AccountResource>();

    constructor(
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {

        this.accountLoaded = this._accountLoaded.asObservable();
        this.accountsLoaded = this._accountsLoaded.asObservable();
        this._accountLoaded.next(true);
        this.accounts = this._accounts.asObservable();
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
        this.refresh();
    }

    /**
     * Refresh the current account
     */
    public refresh(): Observable<any> {
        const accountId = this._currentAccountId.value;
        this._currentAccountValid.next(AccountStatus.Loading);

        const accountObs = this.getOnce(accountId);
        const keyObs = this.getAccountKeys(accountId);
        DataCacheTracker.clearAllCaches(this._accountCache);

        const obs = Observable.forkJoin(accountObs, keyObs);
        obs.subscribe({
            next: ([account, keys]) => {
                this._currentAccount.next({ account, keys });
                if (!this._accountLoaded.value) {
                    this._accountLoaded.next(true);
                }

                this._currentAccountValid.next(AccountStatus.Valid);
            },
            error: (error) => {
                log.error(`Error Loading account ${accountId}`, error);
                this._currentAccountValid.next(AccountStatus.Invalid);
            },
        });

        return obs;
    }

    public load() {
        const obs = this.subscriptionService.subscriptions.flatMap((subscriptions) => {
            const accountObs = subscriptions.map((subscription) => {
                return this.list(subscription.subscriptionId);
            }).toArray();

            return Observable.combineLatest(...accountObs);
        });

        obs.subscribe({
            next: (accountsPerSubscriptions) => {
                const accounts = accountsPerSubscriptions.map(x => x.toArray()).flatten();
                this._accounts.next(List(accounts));
                this._accountsLoaded.next(true);
            },
            error: (error) => {
                log.error("Error loading accounts", error);
            },
        });

        return obs;
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

    public get(accountId: string): RxEntityProxy<AccountParams, AccountResource> {
        return new RxBasicEntityProxy<AccountParams, AccountResource>(AccountResource, {
            cache: () => this._cache,
            initialParams: {
                id: accountId,
            },
            supplyData: ({ id }) => this._getAccount(id),
        });
    }

    public getOnce(accountId: string): Observable<AccountResource> {
        return getOnceProxy(this.get(accountId));
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
        const subId = ArmResourceUtils.getSubscriptionIdFromResourceId(accountId);
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
        const account = favorites.filter(x => x.id === accountId).first();

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

    public patch(accountId: string, properties: AccountPatchDto): Observable<any> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId))
            .flatMap((subscription) => {
                return this.azure.patch(subscription, accountId, { properties: properties.toJS() });
            });
    }

    private _loadFavoriteAccounts(): Observable<List<AccountResource>> {
        let sub = new AsyncSubject<List<AccountResource>>();
        storage.get(this._accountJsonFileName, (error, data) => {
            if (error) {
                log.error("Error retrieving accounts");
                sub.error(error);
            }

            if (Array.isArray(data)) {
                sub.next(List(data.map(x => new AccountResource(x))));
            } else {
                sub.next(List([]));
            }

            sub.complete();
        });

        return sub.asObservable();
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

    private _getAccount(accountId: string): Observable<AccountResource> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId))
            .flatMap((subscription) => {
                return this.azure.get(subscription, accountId)
                    .map(response => {
                        const data = response.json();
                        return this._createAccount(subscription, data);
                    });
            })
            .share();
    }

    private _createAccount(subscription: Subscription, data: any): AccountResource {
        return new AccountResource(Object.assign({}, data, { subscription }));
    }
}
