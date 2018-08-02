import { Injectable } from "@angular/core";
import { RequestOptions, Response, URLSearchParams } from "@angular/http";
import { DataCache, DataCacheTracker, EntityView } from "@batch-flask/core";
import { AccountKeys, AccountResource, BatchAccountAttributes, Subscription } from "app/models";
import { AccountPatchDto } from "app/models/dtos";
import { ArmResourceUtils, log } from "app/utils";
import { Constants } from "common";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable, combineLatest, empty, forkJoin, of } from "rxjs";
import { expand, filter, flatMap, map, reduce, share } from "rxjs/operators";
import { AzureHttpService } from "./azure-http.service";
import { BasicEntityGetter } from "./core";
import { LocalFileStorage } from "./local-file-storage.service";
import { SubscriptionService } from "./subscription.service";

const batchProvider = "Microsoft.Batch";
const batchResourceProvider = batchProvider + "/batchAccounts";

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
}

export interface AvailabilityResult {
    nameAvailable: boolean;
    reason?: string;
    message?: string;
}

export interface QuotaResult {
    used: number;
    quota: number;
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
    private _currentAccountInvalidError: BehaviorSubject<string> = new BehaviorSubject(null);
    private _accountLoaded = new BehaviorSubject<boolean>(false);
    private _currentAccountId = new BehaviorSubject<string>(null);
    private _accounts = new BehaviorSubject<List<AccountResource>>(List([]));
    private _accountsLoaded = new AsyncSubject<boolean>();
    private _cache = new DataCache<AccountResource>();
    private _getter: BasicEntityGetter<AccountResource, AccountParams>;

    constructor(
        private storage: LocalFileStorage,
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {

        this.accountLoaded = this._accountLoaded.asObservable();
        this.accountsLoaded = this._accountsLoaded.asObservable();
        this._accountLoaded.next(true);
        this.accounts = this._accounts.asObservable();

        this._getter = new BasicEntityGetter(AccountResource, {
            cache: () => this._cache,
            supplyData: ({ id }) => this._getAccount(id),
        });

        this._currentAccount.subscribe((selection) => {
            if (selection) {
                const { account } = selection;
                localStorage.setItem(Constants.localStorageKey.selectedAccountId, account.id);
                this.validateCurrentAccount();
            } else {
                this._currentAccountValid.next(AccountStatus.Invalid);
                this._currentAccountInvalidError.next(null);
            }
        });

        this.currentAccountId = this._currentAccountId.asObservable();

        this.currentAccount = this._currentAccountId.pipe(
            flatMap((id) => {
                return this._currentAccount.pipe(
                    filter(x => x && id && x.account && x.account.id.toLowerCase() === id.toLowerCase()),
                    map(x => x && x.account),
                );
            }),
        );
    }

    public get accountFavorites(): Observable<List<AccountResource>> {
        return this._accountFavorites.asObservable();
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return this._currentAccountValid.asObservable();
    }

    public get currentAccountInvalidError(): Observable<string> {
        return this._currentAccountInvalidError.asObservable();
    }

    public selectAccount(accountId: string) {
        const current = this._currentAccountId.value;
        if (current === accountId) {
            return;
        }
        this._currentAccountId.next(accountId);
        // Clear last selected storage account
        const lastSelectedAccount = localStorage.getItem(Constants.localStorageKey.lastStorageAccount);
        if (lastSelectedAccount !== "file-groups") {
            localStorage.removeItem(Constants.localStorageKey.lastStorageAccount);
        }
        this.refresh();
    }

    /**
     * Refresh the current account
     */
    public refresh(): Observable<any> {
        const accountId = this._currentAccountId.value;
        this._currentAccountValid.next(AccountStatus.Loading);
        this._currentAccountInvalidError.next(null);

        const obs = this.get(accountId);
        DataCacheTracker.clearAllCaches(this._cache);
        obs.subscribe({
            next: (account) => {
                this._currentAccount.next({ account });
                if (!this._accountLoaded.value) {
                    this._accountLoaded.next(true);
                }
                this._currentAccountValid.next(AccountStatus.Valid);
            },
            error: (error) => {
                log.error(`Error Loading account ${accountId}`, error);
                this._currentAccountValid.next(AccountStatus.Invalid);
                this._currentAccountInvalidError.next(error && error.message);
            },
        });

        return obs;
    }

    public load() {
        this._loadCachedAccounts();
        const obs = this.subscriptionService.subscriptions.pipe(
            flatMap((subscriptions) => {
                const accountObs = subscriptions.map((subscription) => {
                    return this.list(subscription.subscriptionId);
                }).toArray();

                return combineLatest(...accountObs);
            }),
        );

        obs.subscribe({
            next: (accountsPerSubscriptions) => {
                const accounts = accountsPerSubscriptions.map(x => x.toArray()).flatten();
                this._accounts.next(List(accounts));
                this._cacheAccounts();
                this._markAccountsAsLoaded();
            },
            error: (error) => {
                log.error("Error loading accounts", error);
            },
        });

        return obs;
    }

    public list(subscriptionId: string): Observable<List<AccountResource>> {
        const search = new URLSearchParams();
        search.set("$filter", `resourceType eq '${batchResourceProvider}'`);
        const options = new RequestOptions({ search });

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, `/subscriptions/${subscriptionId}/resources`, options).pipe(
                    map(response => {
                        return List<AccountResource>(response.json().value.map((data) => {
                            return new AccountResource(Object.assign({}, data, { subscription }));
                        }));
                    }),
                );
            }),
            share(),
        );
    }

    public view(): EntityView<AccountResource, AccountParams> {
        return new EntityView({
            cache: () => this._cache,
            getter: this._getter,
        });
    }

    public get(accountId: string): Observable<AccountResource> {
        return this._getter.fetch({ id: accountId });
    }

    public getFromCache(accountId: string): Observable<AccountResource> {
        return this._getter.fetch({ id: accountId }, { cached: true });
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
        return this.subscriptionService.get(subId).pipe(
            flatMap((sub) => this.azure.post(sub, `${accountId}/listKeys`)),
            map(response => new AccountKeys(response.json())),
            share(),
        );
    }

    public favoriteAccount(accountId: string): Observable<any> {
        if (this.isAccountFavorite(accountId)) {
            return of(true);
        }

        const subject = new AsyncSubject();
        this.get(accountId).subscribe({
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
        this._currentAccountInvalidError.next(null);
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
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.patch(subscription, accountId, { properties: properties.toJS() });
            }),
        );
    }

    public putResourcGroup(sub: Subscription, resourceGroup: string, body: any) {
        const rgUri = this.getResoureGroupId(sub, resourceGroup);
        return this.azure.put(sub, rgUri, { body: body });
    }

    public putBatchAccount(sub: Subscription, resourceGroup: string, accountName: string, body: any): Observable<any> {
        const accountUri = this.getAccountId(sub, resourceGroup, accountName);
        return this.azure.put(sub, accountUri, { body: body });
    }

    public deleteBatchAccount(accountId: string): Observable<any> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.delete(subscription, accountId);
            }),
        );
    }

    public getAccountId(sub: Subscription, resourceGroup: string, accountName: string): string {
        const uriPrefix = this.getResoureGroupId(sub, resourceGroup);
        return `${uriPrefix}/providers/${batchProvider}/batchAccounts/${accountName}`;
    }

    public getResoureGroupId(sub: Subscription, resourceGroup: string): string {
        return `subscriptions/${sub.subscriptionId}/resourceGroups/${resourceGroup}`;
    }

    /**
     * Call nameAvailability api to get account conflict info per location
     * @param subscriptionId
     */
    public nameAvailable(name: string, subscription: Subscription, location: string): Observable<AvailabilityResult> {
        if (!name || !subscription || !location) {
            return of(null);
        }
        const uri = `subscriptions/${subscription.subscriptionId}/providers/${batchProvider}`
            + `/locations/${location}/checkNameAvailability`;
        return this.azure.post(subscription, uri, {
            name: name,
            type: batchResourceProvider,
        }).pipe(
            map(response => {
                return response.json();
            }),
        );
    }

    /**
     * Call quota api and resource api to get result of whether current subscription quota reached or not
     * @param subscription
     * @param location
     */
    public accountQuota(subscription: Subscription, location: string): Observable<QuotaResult> {
        if (!subscription || !location) {
            return of(null);
        }

        // get current subscription account quota
        const quotaUri = `subscriptions/${subscription.subscriptionId}/providers/${batchProvider}`
            + `/locations/${location}/quotas`;
        const getQuotaObs = this.azure.get(subscription, quotaUri).pipe(map(response => {
            return response.json();
        }));

        // get current batch accounts number
        const resourceUri = `/subscriptions/${subscription.subscriptionId}/resources`;
        const search = new URLSearchParams();
        search.set("$filter", `resourceType eq '${batchResourceProvider}' and location eq '${location}'`);
        const options = new RequestOptions({ search });
        const batchAccountObs = this.azure.get(subscription, resourceUri, options).pipe(
            expand(obs => {
                return obs.json().nextLink ?
                    this.azure.get(subscription, obs.json().nextLink, options) : empty();
            }),
            reduce((batchAccounts, response: Response) => {
                return [...batchAccounts, ...response.json().value];
            }, []),
        );

        return forkJoin([getQuotaObs, batchAccountObs]).pipe(
            map(results => {
                if (!results[0] || !Array.isArray(results[1])) {
                    return null;
                }
                return {
                    used: results[1].length,
                    quota: results[0].accountQuota,
                };
            }),
        );
    }

    private _loadFavoriteAccounts(): Observable<List<AccountResource>> {
        return this.storage.get(this._accountJsonFileName).pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    return List(data.map(x => new AccountResource(x)));
                } else {
                    return List([]);
                }
            }),
            share(),
        );
    }

    private _saveAccountFavorites(accounts: List<AccountResource> = null): Observable<any> {
        accounts = accounts === null ? this._accountFavorites.getValue() : accounts;
        return this.storage.set(this._accountJsonFileName, accounts.toJS());
    }

    private _getAccount(accountId: string): Observable<BatchAccountAttributes> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, accountId).pipe(
                    map(response => {
                        const data = response.json();
                        return this._createAccount(subscription, data);
                    }),
                );
            }),
            share(),
        );
    }

    private _createAccount(subscription: Subscription, data: any): BatchAccountAttributes {
        return { ...data, subscription };
    }

    private _markAccountsAsLoaded() {
        this._accountsLoaded.next(true);
        this._accountsLoaded.complete();
    }

    private _cacheAccounts() {
        localStorage.setItem(Constants.localStorageKey.batchAccounts, JSON.stringify(this._accounts.value.toJS()));
    }

    private _loadCachedAccounts() {
        const str = localStorage.getItem(Constants.localStorageKey.batchAccounts);

        try {
            const data = JSON.parse(str);

            if (data.length === 0) {
                this._clearCachedAccounts();
            } else {
                const accounts = data.map(x => new AccountResource(x));
                this._accounts.next(List<AccountResource>(accounts));
                this._markAccountsAsLoaded();
            }
        } catch (e) {
            this._clearCachedAccounts();
        }
    }

    private _clearCachedAccounts() {
        localStorage.removeItem(Constants.localStorageKey.batchAccounts);
    }

}
