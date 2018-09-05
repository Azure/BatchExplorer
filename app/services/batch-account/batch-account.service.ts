import { Injectable, OnDestroy } from "@angular/core";
import { RequestOptions, URLSearchParams } from "@angular/http";
import { BasicEntityGetter, DataCache, DataCacheTracker, EntityView } from "@batch-flask/core";
import {
    AccountKeys, ArmBatchAccount, BatchAccount, LOCAL_BATCH_ACCOUNT_PREFIX, LocalBatchAccount,
} from "app/models";
import { ArmResourceUtils, log } from "app/utils";
import { Constants } from "common";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable, combineLatest, of } from "rxjs";
import { filter, flatMap, map, share, shareReplay, tap } from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
import { LocalFileStorage } from "../local-file-storage.service";
import { SubscriptionService } from "../subscription.service";
import { ArmBatchAccountService } from "./arm-batch-account.service";
import { LocalBatchAccountService } from "./local-batch-account.service";

const batchProvider = "Microsoft.Batch";
const batchResourceProvider = batchProvider + "/batchAccounts";

export enum AccountStatus {
    Valid,
    Invalid,
    Loading,
}

@Injectable()
export class BatchAccountService implements OnDestroy {
    public accountLoaded: Observable<boolean>;
    public accountsLoaded: Observable<boolean>;
    public accounts: Observable<List<BatchAccount>>;

    /**
     * @returns the current account.
     * If the current loaded account match the currentAccountId it will return immediately
     * otherwise this will wait for the account with currentAccountId to be loaded
     */
    public currentAccount: Observable<BatchAccount>;

    /**
     * This represent the value of the current accountId.
     * This change value immediately after calling #selectAccount
     */
    public currentAccountId: Observable<string>;

    private _accountJsonFileName: string = "account-favorites";
    private _accountFavorites: BehaviorSubject<List<BatchAccount>> = new BehaviorSubject(List([]));
    private _accountLoaded = new BehaviorSubject<boolean>(false);
    private _currentAccountId = new BehaviorSubject<string>(null);
    private _accounts = new BehaviorSubject<List<BatchAccount>>(List([]));
    private _accountsLoaded = new AsyncSubject<boolean>();
    private _cache = new DataCache<BatchAccount>();

    constructor(
        private armBatchAccountService: ArmBatchAccountService,
        private localBatchAccountService: LocalBatchAccountService,
        private storage: LocalFileStorage,
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {

        this.accountLoaded = this._accountLoaded.asObservable();
        this.accountsLoaded = this._accountsLoaded.asObservable();
        this._accountLoaded.next(true);
        this.accounts = combineLatest(this._accounts.asObservable(), this.localBatchAccountService.accounts).pipe(
            map(([a, b]) => List(b.concat(a))),
        );

        this.currentAccountId = this._currentAccountId.asObservable();

        this.currentAccount = this._currentAccountId.pipe(
            tap((id) => {
                // localStorage.setItem(Constants.localStorageKey.selectedAccountId, id);
            }),
            flatMap((id) => {
                console.log("Get by id", id);
                return this.getFromCache(id);
            }),
            tap(x => console.log("X?", x)),
            filter(x => Boolean(x)),
            shareReplay(1),
        );
    }

    public ngOnDestroy() {
        this._currentAccountId.complete();
    }

    public get accountFavorites(): Observable<List<BatchAccount>> {
        return this._accountFavorites.asObservable();
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return of(AccountStatus.Valid);
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

        DataCacheTracker.clearAllCaches(this._cache);
        return this.get(accountId).pipe(
            tap(() => {
                if (!this._accountLoaded.value) {
                    this._accountLoaded.next(true);
                }
            }),
        );
    }

    public view(): EntityView<BatchAccount, { id: string }> {
        return new EntityView({
            cache: () => this._cache,
            getter: new BasicEntityGetter(Object as any, {
                cache: () => this._cache,
                supplyData: (params) => this.get(params.id),
            }),
        });
    }

    public load() {
        this.localBatchAccountService.load().subscribe();
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

    public list(subscriptionId: string): Observable<List<BatchAccount>> {
        const search = new URLSearchParams();
        search.set("$filter", `resourceType eq '${batchResourceProvider}'`);
        const options = new RequestOptions({ search });

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, `/subscriptions/${subscriptionId}/resources`, options).pipe(
                    map(response => {
                        return List<BatchAccount>(response.json().value.map((data) => {
                            return new ArmBatchAccount(Object.assign({}, data, { subscription }));
                        }));
                    }),
                );
            }),
            share(),
        );
    }

    public get(accountId: string): Observable<BatchAccount | null> {
        if (!accountId) { return of(null); }

        if (accountId.startsWith(LOCAL_BATCH_ACCOUNT_PREFIX)) {
            return this.localBatchAccountService.get(accountId);
        } else {
            return this.armBatchAccountService.get(accountId);
        }
    }

    public getFromCache(accountId: string): Observable<BatchAccount | null> {
        if (!accountId) { return of(null); }
        if (accountId.startsWith(LOCAL_BATCH_ACCOUNT_PREFIX)) {
            return this.localBatchAccountService.get(accountId);
        } else {
            return this.armBatchAccountService.getFromCache(accountId);
        }
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
        this._accountFavorites.next(List<BatchAccount>(newAccounts));
        this._saveAccountFavorites();
    }

    public isAccountFavorite(accountId: string): boolean {
        accountId = accountId.toLowerCase();
        const favorites = this._accountFavorites.getValue();
        const account = favorites.filter(x => x.id === accountId).first();

        return Boolean(account);
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

    public deleteBatchAccount(accountId: string) {
        return this.getFromCache(accountId).pipe(
            flatMap((account) => {
                if (account instanceof ArmBatchAccount) {
                    return this.armBatchAccountService.delete(accountId);
                } else if (account instanceof LocalBatchAccount) {
                    // TODO-TIM
                }
            }),
        );
    }

    public getAccountNameFromId(accountId: string): any {
        if (accountId.startsWith(LOCAL_BATCH_ACCOUNT_PREFIX)) {
            return "FOO_LOCAL"; // TODO-TIM
        } else {
            return ArmResourceUtils.getAccountNameFromResourceId(accountId);
        }
    }

    private _loadFavoriteAccounts(): Observable<List<BatchAccount>> {
        return this.storage.get(this._accountJsonFileName).pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    return List(data.map(x => new ArmBatchAccount(x)));
                } else {
                    return List([]);
                }
            }),
            share(),
        );
    }

    private _saveAccountFavorites(accounts: List<BatchAccount> = null): Observable<any> {
        accounts = accounts === null ? this._accountFavorites.getValue() : accounts;
        return this.storage.set(this._accountJsonFileName, accounts.toJS());
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
                const accounts = data.map(x => new ArmBatchAccount(x));
                this._accounts.next(List<BatchAccount>(accounts));
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
