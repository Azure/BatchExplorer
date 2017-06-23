import { Type } from "@angular/core";
import { List, OrderedSet } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { log } from "app/utils";
import { ListOptions, ListOptionsAttributes } from "./list-options";
import { RxProxyBase, RxProxyBaseConfig } from "./rx-proxy-base";

export interface RxListProxyConfig<TParams, TEntity> extends RxProxyBaseConfig<TParams, TEntity> {
    initialOptions?: ListOptionsAttributes;
}

export abstract class RxListProxy<TParams, TEntity> extends RxProxyBase<TParams, ListOptions, TEntity> {
    public items: Observable<List<TEntity>>;
    public hasMore: Observable<boolean>;

    private _itemKeys: BehaviorSubject<OrderedSet<string>> = new BehaviorSubject(OrderedSet([]));
    private _hasMore: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _lastRequest: { params: TParams, options: any };

    /**
     * If polling this list proxy this is a flag if it should fetch all or just the first set
     */
    private _pollFetchAll: boolean = false;

    constructor(type: Type<TEntity>, config: RxListProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._options = new ListOptions(config.initialOptions || {});
        this.params = config.initialParams;
        this._hasMore.next(true);
        this.hasMore = this._hasMore.asObservable();

        this.items = this._itemKeys.distinctUntilChanged().map((itemKeys) => {
            return this.cache.items.map((items) => {
                let keys: any = itemKeys;
                if (this._options.maxItems) {
                    keys = itemKeys.slice(0, this._options.maxItems);
                }
                return List<TEntity>(keys.map((x) => items.get(x)));
            });
        }).switch().distinctUntilChanged().takeUntil(this.isDisposed);

        this.deleted.subscribe((deletedKey) => {
            this._itemKeys.next(OrderedSet<string>(this._itemKeys.value.filter((key) => key !== deletedKey)));
        });

        this._cacheCleared.subscribe((deletedKey) => {
            this._itemKeys.next(OrderedSet<string>([]));
        });
    }

    public startPoll(interval: number, fetchAll: boolean = false) {
        this._pollFetchAll = fetchAll;
        return super.startPoll(interval);
    }

    public updateParams(params: TParams) {
        this.params = params;
        this.handleChanges(this._params, this._options);
    }

    public setOptions(options: ListOptionsAttributes, clearItems = true) {
        super.setOptions(new ListOptions(options));
        this.handleChanges(this._params, this._options);
        if (clearItems) {
            this._itemKeys.next(OrderedSet([]));
        }

        this._hasMore.next(true);
    }

    public patchOptions(options: ListOptionsAttributes | ListOptions, clearItems = true) {
        this.setOptions(this._options.merge(new ListOptions(options)).original);
    }

    /**
     * Fetch a new batch of items.
     * @param forceNew when fetching the first batch of items this will force to load data from the server
     *                  instead of loading from cache
     */
    public fetchNext(forceNew = false): Observable<any> {
        if (!this._hasMore.value) {
            return Observable.of({ data: [] });
        }
        const subject = new AsyncSubject();

        this._tryLoadFromQueryCache(forceNew);
        this._fetchNextKeys().subscribe({
            next: (keys: OrderedSet<string>) => {
                const currentKeys = this._itemKeys.value;
                if (currentKeys.size === 0) {
                    this.cache.queryCache.cacheQuery(this._options.filter, keys, null);
                }
                this._updateNewKeys(keys);
                subject.next(true);
                subject.complete();
            },
            error: (error) => {
                this._hasMore.next(false);
                subject.error(error);
            },
        });

        return subject.asObservable();
    }

    public fetchAll(): Observable<any> {
        const subject = new AsyncSubject();
        subject.next(true);
        this._fetchRemainingKeys().subscribe({
            next: (keys: OrderedSet<string>) => {
                this._updateNewKeys(keys);
                subject.complete();
            },
            error: (e) => subject.error(e),
        });

        return subject.asObservable();
    }

    /**
     * This add a new item to the list by loading it from a entity proxy
     * It should not add the new item if already present.
     * The cache system will handle updating it already.
     */
    public loadNewItem(getOnceObs: Observable<TEntity>): Observable<any> {
        getOnceObs.subscribe({
            next: (newItem) => {
                this._addItemToList(newItem);
            }, error: (error) => {
                log.error("Error loading new item into RxListProxy",
                    { error, params: this._params, options: this._options });
            },
        });
        return getOnceObs;
    }

    /**
     * Refresh the list, clearExisiting data will clear the data before doing the request
     * @param clearExistingData If set to false it will only clear the data when the new date comes in.
     *  This means that during the loading time the items are still the old ones.
     */
    public refresh(clearExistingData = true): Observable<any> {
        this.cache.queryCache.clearCache();
        this.setOptions(this._options, clearExistingData);
        return this.fetchNext();
    }

    /**
     * Refresh the list but loads all the data from the server.
     * @param clearExistingData If set to false it will only clear the data when the new date comes in.
     *  This means that during the loading time the items are still the old ones.
     */
    public refreshAll(clearExistingData = true): Observable<any> {
        this.cache.queryCache.clearCache();
        this.setOptions(this._options, clearExistingData);
        return this.fetchAll();
    }

    protected pollRefresh() {
        if (this._pollFetchAll) {
            return this.refreshAll(false);
        } else {
            return this.refresh(false);
        }
    }

    // Method to implement in the child class
    protected abstract handleChanges(params: TParams, options: {});
    protected abstract fetchNextItems(): Observable<any>;
    protected abstract processResponse(response: any): any[];
    protected abstract hasMoreItems(): boolean;
    protected abstract queryCacheKey(): string;

    /**
     * Load all the remaining items from the server and return their keys
     */
    private _fetchRemainingKeys() {
        if (!this.hasMoreItems()) {
            return Observable.of(OrderedSet());
        }

        return this._fetchNextKeys().flatMap((keys: OrderedSet<string>) => {
            return this._fetchRemainingKeys().map(remainingKeys => OrderedSet(keys.concat(remainingKeys)));
        }).share();
    }

    /**
     * Load the next set of items from the server and returns the keys of those items.
     */
    private _fetchNextKeys(): Observable<OrderedSet<string>> {
        const subject = new AsyncSubject();
        this.fetchData({
            getData: () => {
                return this.fetchNextItems();
            },
            next: (response: any) => {
                const keys = OrderedSet(this.newItems(this.processResponse(response)));
                this._hasMore.next(this.hasMoreItems()); // This NEEDS to be called after processResponse
                subject.next(keys);
                subject.complete();
            },
            error: (error) => {
                this._hasMore.next(false);
                subject.error(error);
            },
        });

        return subject.asObservable();
    }

    private _updateNewKeys(newKeys: OrderedSet<string>) {
        const currentKeys = this._itemKeys.value;

        const last = this._lastRequest;
        if (last && (last.params !== this._params || last.options !== this._options)) {
            this._itemKeys.next(newKeys);
        } else {
            this._itemKeys.next(OrderedSet<string>(currentKeys.concat(newKeys)));
        }

        this._lastRequest = { params: this._params, options: this._options };
    }
    /**
     * This will try to load keys from the query cache
     * This succeed only if there is no item currently loaded, we don't want new data and there is cached data.
     */
    private _tryLoadFromQueryCache(forceNew: boolean): boolean {
        if (this._itemKeys.value.size !== 0 || forceNew) {
            return false;
        }

        const cachedList = this.cache.queryCache.getKeys(this._options.filter);
        if (!cachedList) {
            return false;
        }

        this._itemKeys.next(cachedList.keys);
        this._lastRequest = { params: this._params, options: this._options };
        this._hasMore.next(this.hasMoreItems());
        this._status.next(LoadingStatus.Ready);

        return true;
    }

    /**
     * Add the given item to the list and the query cache.
     * @param newItem newItem to be added
     */
    private _addItemToList(newItem: TEntity) {
        if (!newItem) { return; }

        const key = this.cache.getItemKey(newItem);
        const itemKeys = this._itemKeys;
        if (itemKeys.value.has(key)) {
            return;
        }

        this._itemKeys.next(OrderedSet(OrderedSet([key]).concat(this._itemKeys.value)));
        this._cache.queryCache.addKeyToQuery(null, key);
    }
}

export function getAllProxy<TEntity>(getProxy: RxListProxy<any, TEntity>): Observable<List<TEntity>> {
    const obs = new AsyncSubject<List<TEntity>>();

    getProxy.fetchAll().subscribe({
        next: () => {
            getProxy.items.subscribe((items: List<TEntity>) => {
                obs.next(items);
                obs.complete();
                getProxy.dispose();
            });
        },
        error: (e) => {
            obs.error(e);
            obs.complete();
            getProxy.dispose();
        },
    });

    return obs.asObservable();
}
