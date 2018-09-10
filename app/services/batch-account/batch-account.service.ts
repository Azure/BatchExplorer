import { Injectable, OnDestroy } from "@angular/core";
import { BasicEntityGetter, DataCache, DataCacheTracker, EntityView } from "@batch-flask/core";
import {
    AccountKeys, ArmBatchAccount, BatchAccount, LOCAL_BATCH_ACCOUNT_PREFIX,
} from "app/models";
import { ArmResourceUtils } from "app/utils";
import { Constants } from "common";
import { List } from "immutable";
import { BehaviorSubject, Observable, combineLatest, forkJoin, of } from "rxjs";
import { filter, flatMap, map, share, shareReplay } from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
import { LocalFileStorage } from "../local-file-storage.service";
import { SubscriptionService } from "../subscription.service";
import { ArmBatchAccountService } from "./arm-batch-account.service";
import { LocalBatchAccountService } from "./local-batch-account.service";

export enum AccountStatus {
    Valid,
    Invalid,
    Loading,
}

@Injectable()
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

    private _accountJsonFileName: string = "account-favorites";
    private _accountFavorites: BehaviorSubject<List<{ id: string }>> = new BehaviorSubject(List([]));
    private _currentAccountId = new BehaviorSubject<string>(null);
    private _cache = new DataCache<BatchAccount>();
    private _getter: BasicEntityGetter<BatchAccount, { id: string }>;

    constructor(
        private armBatchAccountService: ArmBatchAccountService,
        private localBatchAccountService: LocalBatchAccountService,
        private storage: LocalFileStorage,
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
            flatMap((id) => this.getFromCache(id)),
            filter(x => Boolean(x)),
            shareReplay(1),
        );

        this.accountFavorites = this._accountFavorites.pipe(
            flatMap((favourites) => {
                return forkJoin(...favourites.map(x => this.getFromCache(x.id)).toArray());
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
        return this._getter.fetch({id});
    }

    public getFromCache(id: string): Observable<BatchAccount | null> {
        if (!id) { return of(null); }
        return this._getter.fetch({id}, {cached: true});
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
        this._accountFavorites.next(this._accountFavorites.value.push({
            id: accountId,
        }));
        return this._saveAccountFavorites();
    }

    public unFavoriteAccount(accountId: string) {
        accountId = accountId.toLowerCase();
        if (!this.isAccountFavorite(accountId)) {
            return;
        }

        const newAccounts = this._accountFavorites.value.filter(account => account.id.toLowerCase() !== accountId);
        this._accountFavorites.next(List<BatchAccount>(newAccounts));
        return this._saveAccountFavorites();
    }

    public isAccountFavorite(accountId: string): boolean {
        accountId = accountId.toLowerCase();
        const favorites = this._accountFavorites.value;
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
        });
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

    private _saveAccountFavorites(accounts: List<{ id: string }> = null): Observable<any> {
        accounts = accounts === null ? this._accountFavorites.value : accounts;
        return this.storage.set(this._accountJsonFileName, accounts.toJS());
    }

    private _fetchAccount(id: string) {
        if (id.startsWith(LOCAL_BATCH_ACCOUNT_PREFIX)) {
            return this.localBatchAccountService.get(id);
        } else {
            return this.armBatchAccountService.get(id);
        }
    }
}
