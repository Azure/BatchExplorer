import { LoadingStatus } from "app/components/base/loading";
import { List, OrderedSet } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { log } from "app/utils";
import { GenericView, GenericViewConfig } from "./generic-view";
import { ListGetter, ListResponse } from "./list-getter";
import { ContinuationToken, ListOptions, ListOptionsAttributes } from "./list-options";

export interface ListViewConfig<TEntity, TParams> extends GenericViewConfig<TEntity, TParams> {
    getter: ListGetter<TEntity, TParams>;
    initialOptions?: ListOptions | ListOptionsAttributes;
}

export class ListView<TEntity, TParams> extends GenericView<TEntity, TParams, ListOptions> {
    public items: Observable<List<TEntity>>;
    public hasMore: Observable<boolean>;

    private _itemKeys: BehaviorSubject<OrderedSet<string>> = new BehaviorSubject(OrderedSet([]));
    private _hasMore: BehaviorSubject<boolean> = new BehaviorSubject(true);

    private _getter: ListGetter<TEntity, TParams>;
    private _nextLink: ContinuationToken = null;
    private _lastRequest: { params: TParams, options: ListOptions };

    /**
     * If polling this list proxy this is a flag if it should fetch all or just the first set
     */
    private _pollFetchAll: boolean = false;

    constructor(config: ListViewConfig<TEntity, TParams>) {
        super(config);
        this._getter = config.getter;
        this._options = new ListOptions(config.initialOptions || {});

        this.items = this._itemKeys.distinctUntilChanged().map((itemKeys) => {
            return this.cache.items.map((items) => {
                let keys: any = itemKeys;
                if (this._options.maxItems) {
                    keys = itemKeys.slice(0, this._options.maxItems);
                }
                return List<TEntity>(keys.map((x) => items.get(x)));
            });
        }).switch().distinctUntilChanged((a, b) => a.equals(b)).takeUntil(this.isDisposed);
        this.hasMore = this._hasMore.asObservable();

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
        this._handleChanges();
    }

    public setOptions(options: ListOptionsAttributes, clearItems = true) {
        super.setOptions(new ListOptions(options));
        this._handleChanges();
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
        let fetchObs;
        if (this._nextLink === null) {
            this._tryToLoadFromCache(forceNew);
            fetchObs = () => this._getter.fetch(this._params, this._options, true);
        } else {
            fetchObs = () => this._getter.fetch(this._nextLink);
        }
        return this.fetchData({
            getData: fetchObs,
            next: (response: ListResponse<TEntity>) => {
                this._updateNewKeys(this._retrieveKeys(response.items));
                this._nextLink = response.nextLink;
                this._hasMore.next(Boolean(response.nextLink)); // This NEEDS to be called after processResponse
            },
            error: (error) => {
                this._hasMore.next(false);
            },
        });
    }

    public fetchAll(): Observable<any> {
        const obs = this._getter.fetchAll(this._params, this._options);

        obs.subscribe({
            next: (items) => {
                this._updateNewKeys(this._retrieveKeys(items));
                this._hasMore.next(false);
            },
            error: (e) => this._hasMore.next(false),
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

    /**
     * This add a new item to the list by loading it from a entity proxy
     * It should not add the new item if already present.
     * The cache system will handle updating it already.
     */
    public loadNewItem(getObs: Observable<TEntity>): Observable<any> {
        getObs.subscribe({
            next: (newItem) => {
                this._addItemToList(newItem);
            },
            error: (error) => {
                log.error("Error loading new item into ListView",
                    { error, params: this._params, options: this._options });
            },
        });
        return getObs;
    }

    protected pollRefresh() {
        if (this._pollFetchAll) {
            return this.refreshAll(false);
        } else {
            return this.refresh(false);
        }
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
        this.cache.queryCache.addKeyToQuery(null, key);
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
     * Try to see if the entity is already in the cache if so load it immediatelly.
     * @returns boolean if it loaded items from the cache
     */
    private _tryToLoadFromCache(forceNew): boolean {
        if (forceNew) {
            return false;
        }
        const response = this._getter.fetchFromCache(this._params, this._options);
        if (!response) { return false; }
        this._itemKeys.next(this._retrieveKeys(response.items));
        this._lastRequest = { params: this._params, options: this._options };
        this._hasMore.next(Boolean(response.nextLink));
        this._status.next(LoadingStatus.Ready);
        return true;
    }

    private _retrieveKeys(items: List<TEntity>): OrderedSet<string> {
        return OrderedSet(items.map((x => x[this.cache.uniqueField].toString())));
    }

    private _handleChanges() {
        this._nextLink = null;
    }
}
