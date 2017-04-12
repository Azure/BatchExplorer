import { Type } from "@angular/core";
import { List, OrderedSet } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { log } from "app/utils";
import { ListOptions, ListOptionsAttributes } from "./list-options";
import { RxEntityProxy } from "./rx-entity-proxy";
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

    constructor(type: Type<TEntity>, config: RxListProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._options = new ListOptions(config.initialOptions || {});
        this.params = config.initialParams;
        this._hasMore.next(true);
        this.hasMore = this._hasMore.asObservable();

        this.items = this._itemKeys.map((itemKeys) => {
            return this.cache.items.map((items) => {
                let keys: any = itemKeys;
                if (this._options.maxItems) {
                    keys = itemKeys.slice(0, this._options.maxItems);
                }
                return List<TEntity>(keys.map((x) => items.get(x)));
            });
        }).switch();

        this.deleted.subscribe((deletedKey) => {
            this._itemKeys.next(OrderedSet<string>(this._itemKeys.value.filter((key) => key !== deletedKey)));
        });
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

        this._tryLoadFromQueryCache(forceNew);

        return this.fetchData({
            getData: () => {
                return this.fetchNextItems();
            },
            next: (response: any) => {
                const keys = OrderedSet(this.newItems(this.processResponse(response)));
                this._hasMore.next(this.hasMoreItems());
                const currentKeys = this._itemKeys.value;
                if (currentKeys.size === 0) {
                    this.cache.queryCache.cacheQuery(this._options.filter, keys, null);
                }

                const last = this._lastRequest;
                if (last && (last.params !== this._params || last.options !== this._options)) {
                    this._itemKeys.next(keys);
                } else {
                    this._itemKeys.next(OrderedSet<string>(currentKeys.concat(keys)));
                }

                this._lastRequest = { params: this._params, options: this._options };
            },
            error: (error) => {
                this._hasMore.next(false);
            },
        });
    }

    public fetchAll(): Observable<any> {
        if (!this.hasMoreItems()) {
            return Observable.of(true);
        }

        const subject = new AsyncSubject();
        subject.next(true);
        this.fetchNext().subscribe({
            complete: () => {
                this.fetchAll().subscribe({
                    complete: () => subject.complete(),
                    error: (e) => subject.error(e),
                });
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
    public loadNewItem(entityProxy: RxEntityProxy<any, TEntity>): Observable<any> {
        const obs = entityProxy.fetch().flatMap(() => entityProxy.item.first());
        obs.subscribe({
            next: (newItem) => {
                this._addItemToList(newItem);
            }, error: (error) => {
                log.error("Error loading new item into RxListProxy",
                    { error, params: this._params, options: this._options });
            },
        });

        return obs;
    }

    /**
     * Refresh the list, clearExisiting data will clear the data before doing the request
     * @param clearExistingData If set to false it will only clear the data when the new date comes in.
     *  This means that during the loading time the items are still the old ones.
     */
    public refresh(clearExistingData = true): Observable<any> {
        this.cache.queryCache.clearCache();
        this.setOptions(this._options, clearExistingData);
        return this.fetchNext(true);
    }

    protected pollRefresh() {
        return this.refresh(false);
    }

    // Method to implement in the child class
    protected abstract handleChanges(params: TParams, options: {});
    protected abstract fetchNextItems(): Observable<any>;
    protected abstract processResponse(response: any): any[];
    protected abstract hasMoreItems(): boolean;
    protected abstract queryCacheKey(): string;

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
