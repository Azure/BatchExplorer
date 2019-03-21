import { Injectable, OnDestroy } from "@angular/core";
import { BasicEntityGetter, DataCache, DataCacheTracker, EntityView, UserSpecificDataStore } from "@batch-flask/core";
import {
    AccountKeys, ArmBatchAccount, BatchAccount, LOCAL_BATCH_ACCOUNT_PREFIX,
} from "app/models";
import { ArmResourceUtils } from "app/utils";
import { Constants } from "common";
import { UserSpecificStoreKeys } from "common/constants";
import { List } from "immutable";
import { BehaviorSubject, Observable, combineLatest, forkJoin, from, of } from "rxjs";
import {
    catchError, filter, flatMap, map, publishReplay, refCount, share, shareReplay, switchMap, take, tap,
} from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
import { SubscriptionService } from "../subscription";
import { ArmBatchAccountService } from "./arm-batch-account.service";
import { LocalBatchAccountService } from "./local-batch-account.service";

export enum AccountStatus {
    Valid,
    Invalid,
    Loading,
}

interface AccountFavorite {
    id: string;
}

@Injectable({ providedIn: "root" })
export class BatchAccountService implements OnDestroy {
    public accountLoaded: Observable<boolean>;
    public accounts: Observable<List<BatchAccount>>;
    public accountFavorites: Observable<List<BatchAccount>>;

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

    private _favoriteAccountIds: Observable<List<AccountFavorite>>;
    private _favoritesSet = new Set<string>();
    private _currentAccountId = new BehaviorSubject<string>(null);
    private _cache = new DataCache<BatchAccount>();
    private _getter: BasicEntityGetter<BatchAccount, { id: string }>;

    constructor(
        private armBatchAccountService: ArmBatchAccountService,
        private localBatchAccountService: LocalBatchAccountService,
        private userSpecificStore: UserSpecificDataStore,
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {
        this._getter = new BasicEntityGetter<BatchAccount, { id: string }>(Object as any, {
            cache: () => this._cache,
            supplyData: (params) => this._fetchAccount(params.id),
        });

        this.accounts = combineLatest(
            this.armBatchAccountService.accounts,
            this.localBatchAccountService.accounts,
        ).pipe(
            map(([a, b]) => List(b.concat(a))),
        );

        this.currentAccountId = this._currentAccountId.asObservable();

        this.currentAccount = this._currentAccountId.pipe(
            filter(x => Boolean(x)),
            switchMap((id) => this.getFromCache(id)),
            filter(x => Boolean(x)),
            shareReplay(1),
        );

        this._favoriteAccountIds = this.userSpecificStore.watchItem(UserSpecificStoreKeys.accountFavorites).pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    return List(data.filter(x => x.id != null));
                } else {
                    return List([]);
                }
            }),
            tap((list) => {
                this._favoritesSet = new Set<string>(list.map(x => x.id.toLowerCase()).toArray());
            }),
            publishReplay(1),
            refCount(),
        );

        this.accountFavorites = this._favoriteAccountIds.pipe(
            switchMap((favourites) => {
                const obs = favourites.map(x => this.getFromCache(x.id).pipe(
                    catchError(() => {
                        return of(new ArmBatchAccount({
                            id: x.id,
                        } as any));
                    }),
                )).toArray();

                return forkJoin(...obs);
            }),
            map((items: BatchAccount[]) => List(items.filter(x => Boolean(x)))),
            shareReplay(1),
        );
    }

    public ngOnDestroy() {
        this._currentAccountId.complete();
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return of(AccountStatus.Valid);
    }

    public selectAccount(accountId: string) {
        const current = this._currentAccountId.value;
        if (current === accountId) {
            return;
        }
        localStorage.setItem(Constants.localStorageKey.selectedAccountId, accountId);
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
        return this.get(accountId);
    }

    public view(): EntityView<BatchAccount, { id: string }> {
        return new EntityView({
            cache: () => this._cache,
            getter: this._getter,
        });
    }

    public load() {
        return forkJoin(
            this.localBatchAccountService.load(),
            this.armBatchAccountService.load(),
        );
    }

    public get(id: string): Observable<BatchAccount | null> {
        if (!id) { return of(null); }
        return this._getter.fetch({ id });
    }

    public getFromCache(id: string): Observable<BatchAccount | null> {
        if (!id) { return of(null); }
        return this._getter.fetch({ id }, { cached: true });
    }

    public getAccountKeys(accountId: string): Observable<AccountKeys> {
        const subId = ArmResourceUtils.getSubscriptionIdFromResourceId(accountId);
        return this.subscriptionService.get(subId).pipe(
            flatMap((sub) => this.azure.post(sub, `${accountId}/listKeys`)),
            map(response => new AccountKeys(response)),
            share(),
        );
    }

    public favoriteAccount(accountId: string): Observable<any> {
        if (this.isAccountFavorite(accountId)) {
            return of(true);
        }
        return this._favoriteAccountIds.pipe(
            take(1),
            switchMap((accounts) => {
                return this._saveAccountFavorites(accounts.push({
                    id: accountId,
                }));
            }),
            share(),
        );
    }

    public unFavoriteAccount(accountId: string) {
        accountId = accountId.toLowerCase();
        if (!this.isAccountFavorite(accountId)) {
            return;
        }

        return this._favoriteAccountIds.pipe(
            take(1),
            switchMap((accounts) => {
                const newAccounts = accounts.filter(account => account.id.toLowerCase() !== accountId);
                return this._saveAccountFavorites(List<AccountFavorite>(newAccounts));
            }),
            share(),
        );
    }

    public isAccountFavorite(accountId: string): boolean {
        accountId = accountId.toLowerCase();
        return this._favoritesSet.has(accountId);
    }

    public async loadInitialData() {
        const selectedAccountId = localStorage.getItem(Constants.localStorageKey.selectedAccountId);
        if (selectedAccountId) {
            this.selectAccount(selectedAccountId);
        }
    }

    public delete(accountId: string) {
        if (accountId.startsWith(LOCAL_BATCH_ACCOUNT_PREFIX)) {
            return this.localBatchAccountService.delete(accountId);
        } else {
            return this.armBatchAccountService.delete(accountId);
        }
    }

    public getNameFromId(accountId: string): any {
        if (accountId.startsWith(LOCAL_BATCH_ACCOUNT_PREFIX)) {
            return this.localBatchAccountService.getNameFromId(accountId);
        } else {
            return ArmResourceUtils.getAccountNameFromResourceId(accountId);
        }
    }

    private _saveAccountFavorites(accounts: List<AccountFavorite>): Observable<any> {
        return from(this.userSpecificStore.setItem(UserSpecificStoreKeys.accountFavorites, accounts.toJS()));
    }

    private _fetchAccount(id: string) {
        if (id.startsWith(LOCAL_BATCH_ACCOUNT_PREFIX)) {
            return this.localBatchAccountService.get(id);
        } else {
            return this.armBatchAccountService.get(id);
        }
    }
}
