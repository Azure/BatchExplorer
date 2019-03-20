import { FilterMatcher } from "@batch-flask/core/filter-builder";
import { LoadingStatus } from "@batch-flask/core/loading-status";
import { Record } from "@batch-flask/core/record";
import { log } from "@batch-flask/utils";
import { List, OrderedSet } from "immutable";
import { BehaviorSubject, Observable, combineLatest, of } from "rxjs";
import { distinctUntilChanged, map,  switchMap, takeUntil } from "rxjs/operators";
import { GenericView, GenericViewConfig } from "../generic-view";
import { ListGetter, ListResponse } from "../list-getter";
import { ContinuationToken, ListOptions, ListOptionsAttributes } from "../list-options";

export interface ListViewConfig<TEntity extends Record<any>, TParams> extends GenericViewConfig<TEntity, TParams> {
    getter: ListGetter<TEntity, TParams>;
    initialOptions?: ListOptions | ListOptionsAttributes;
}

export class ListView<TEntity extends Record<any>, TParams> extends GenericView<TEntity, TParams, ListOptions> {
    public readonly items: Observable<List<TEntity>>;
    public readonly hasMore: Observable<boolean>;

    private _itemKeys: BehaviorSubject<OrderedSet<string>> = new BehaviorSubject(OrderedSet([]));
    private _hasMore: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _prepend: BehaviorSubject<OrderedSet<string>> = new BehaviorSubject(OrderedSet([]));

    private _getter: ListGetter<TEntity, TParams>;
    private _nextLink: ContinuationToken | null = null;
    private _lastRequest: { params: TParams, options: ListOptions };

    /**
     * If polling this list proxy this is a flag if it should fetch all or just the first set
     */
    private _pollFetchAll: boolean = false;

    constructor(config: ListViewConfig<TEntity, TParams>) {
        super(config);
        this._getter = config.getter;
        this._options = new ListOptions(config.initialOptions || {});

        this.items = combineLatest(
            // this.cache.items,
            this._itemKeys.pipe(distinctUntilChanged()),
            this._prepend.pipe(distinctUntilChanged()),
            this._params,
        ).pipe(
            switchMap(([itemKeys, prependKeys, params]) => {
                prependKeys = prependKeys.filter((x: string) => !itemKeys.has(x)) as any;

                const allKeys = prependKeys.concat(itemKeys.toJS());

                return this.cache.items.pipe(map((items) => {
                    let keys = allKeys;
                    if (this._options.maxItems) {
                        keys = allKeys.slice(0, this._options.maxItems);
                    }
                    return List<TEntity>(keys.map((x: string) => {
                        const item = items.get(x);
                        if (!item && prependKeys.has(x)) {
                            return new this._getter.type({ ...params, [this.cache.uniqueField]: x });
                        }
                        return item;
                    }).filter((item) => {
                        if (!item) {
                            return false;
                        }
                        const matcher = new FilterMatcher<TEntity>();
                        if (this._options.filter && prependKeys.has(item[this.cache.uniqueField])) {
                            return matcher.test(this._options.filter, item);
                        }
                        return true;
                    }));
                }));
            }),
            distinctUntilChanged((a, b) => a.equals(b)),
            takeUntil(this.isDisposed),
        );
        this.hasMore = this._hasMore.asObservable();

        this.deleted.subscribe((deletedKey) => {
            this._itemKeys.next(OrderedSet<string>(this._itemKeys.value.filter((key) => key !== deletedKey)));
        });

        this._cacheCleared.subscribe(() => {
            this._itemKeys.next(OrderedSet<string>([]));
            this._handleChanges();
            this._hasMore.next(true);
            this.fetchNext();
        });
    }

    public startPoll(interval: number, fetchAll: boolean = false) {
        this._pollFetchAll = fetchAll;
        return super.startPoll(interval);
    }

    public set params(params: TParams) {
        super.params = params;
        console.log("Params", params);
        this._handleChanges();
        this._hasMore.next(true);
    }
    public get params() { return super.params; }

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
    public fetchNext(forceNew = false): Observable<ListResponse<TEntity>> {
        if (!this._hasMore.value) {
            return of({ items: List([]), nextLink: null });
        }
        let fetchObs;
        if (this._nextLink === null) {
            this._tryToLoadFromCache(forceNew);
            fetchObs = () => this._getter.fetch(this.params, this._options, true);
        } else {
            fetchObs = () => this._getter.fetch(this._nextLink!);
        }
        return this.fetchData({
            getData: fetchObs,
            next: (response: ListResponse<TEntity>) => {
                this._updateNewKeys(this._retrieveKeys(response.items));
                this._nextLink = response.nextLink;
                this._hasMore.next(Boolean(response.nextLink)); // This NEEDS to be called after processResponse
            },
            error: (error) => {
                log.error(`Error loading data in ListView for ${this._getter.type.name}`, error);
                this._hasMore.next(false);
            },
        });
    }

    public fetchAll(): Observable<any> {
        const fetchObs = () => this._getter.fetchAll(this.params, this._options);
        return this.fetchData({
            getData: fetchObs,
            next: (items: List<TEntity>) => {
                this._updateNewKeys(this._retrieveKeys(items));
                this._hasMore.next(false);
            },
            error: (error) => {
                this._hasMore.next(false);
            },
        });
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

    public setFixedKeys(keys: string[]) {
        this._prepend.next(OrderedSet(keys));
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
        if (last && (last.params !== this.params || last.options !== this._options)) {
            this._itemKeys.next(newKeys);
        } else {
            this._itemKeys.next(OrderedSet<string>(currentKeys.concat(newKeys)));
        }

        this._lastRequest = { params: this.params, options: this._options };
    }

    /**
     * Try to see if the entity is already in the cache if so load it immediatelly.
     * @returns boolean if it loaded items from the cache
     */
    private _tryToLoadFromCache(forceNew): boolean {
        if (forceNew) {
            return false;
        }
        const response = this._getter.fetchFromCache(this.params, this._options);
        if (!response) { return false; }
        this._itemKeys.next(this._retrieveKeys(response.items));
        // this._lastRequest = { params: this._params, options: this._options };
        // this._hasMore.next(Boolean(response.nextLink));
        this._status.next(LoadingStatus.Ready);
        return true;
    }

    private _retrieveKeys(items: List<TEntity>): OrderedSet<string> {
        return OrderedSet(items.map(((x: TEntity) => x[this.cache.uniqueField].toString())));
    }

    private _handleChanges() {
        this._nextLink = null;
    }
}
