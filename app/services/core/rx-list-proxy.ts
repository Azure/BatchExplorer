import { Type } from "@angular/core";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { DataCache } from "./data-cache";
import { CachedKeyList } from "./query-cache";
import { RxEntityProxy } from "./rx-entity-proxy";
import { RxProxyBase } from "./rx-proxy-base";

export interface RxListProxyConfig<TParams, TEntity> {
    cache: (params: TParams) => DataCache<TEntity>;
    initialOptions?: any;
    initialParams?: any;
}

export abstract class RxListProxy<TParams, TEntity> extends RxProxyBase<TParams, TEntity> {
    public items: Observable<List<TEntity>>;
    public hasMore: Observable<boolean>;

    protected _options: any;

    private _itemKeys: BehaviorSubject<List<string>> = new BehaviorSubject(List([]));
    private _hasMore: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _lastRequest: { params: TParams, options: any };

    constructor(type: Type<TEntity>, config: RxListProxyConfig<TParams, TEntity>) {
        super(type, config.cache);
        this._options = config.initialOptions || {};
        this.params = config.initialParams;
        this._hasMore.next(true);
        this.status = this._status.asObservable();
        this.hasMore = this._hasMore.asObservable();

        this.items = this._itemKeys.map((keys) => {
            return this.cache.items.map((items) => {
                return keys.map((x) => items.get(x));
            });
        }).switch();

        this.deleted.subscribe((deletedKey) => {
            this._itemKeys.next(List<string>(this._itemKeys.getValue().filter((key) => key !== deletedKey)));
        });
    }

    public updateParams(params: TParams) {
        this.params = params;
        this.handleChanges(params, this._options);
    }

    public setOptions(options: {}, clearItems = true) {
        this._options = Object.assign({}, options);
        this.handleChanges(this._params, options);
        if (clearItems) {
            this._itemKeys.next(List([]));
        }
        this._hasMore.next(true);

        if (this.queryInProgress()) {
            this.abortFetch();
        }
    }

    /**
     * Fetch a new batch of items.
     * @param forceNew when fetching the first batch of items this will force to load data from the server
     *                  instead of loading from cache
     */
    public fetchNext(forceNew = false): Observable<any> {
        if (!this._hasMore.getValue()) {
            return Observable.of({ data: [] });
        }

        if (this._itemKeys.getValue().size === 0 && !forceNew) {
            const cachedList = this.cache.queryCache.getKeys(this._options.filter);
            if (cachedList) {
                this.getQueryCacheData(cachedList);
                this._itemKeys.next(cachedList.keys);
                this._lastRequest = { params: this._params, options: this._options };
                return Observable.from(cachedList.keys.toJS());
            }
        }

        return this.fetchData({
            getData: () => {
                return this.fetchNextItems();
            }, next: (response: any) => {
                this._hasMore.next(this.hasMoreItems());
                const keys = List(this.newItems(this.processResponse(response)));
                const currentKeys = this._itemKeys.getValue();
                if (currentKeys.size === 0) {
                    this.cache.queryCache.cacheQuery(this._options.filter, keys, this.putQueryCacheData());
                }
                const last = this._lastRequest;
                if (last && (last.params !== this._params || last.options !== this._options)) {
                    this._itemKeys.next(keys);
                } else {
                    this._itemKeys.next(List<string>(currentKeys.concat(keys)));
                }
                this._lastRequest = { params: this._params, options: this._options };
            },
            error: (error) => {
                this._itemKeys.error(error);
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

    public loadNewItem(entityProxy: RxEntityProxy<any, TEntity>) {
        const sub = entityProxy.item.subscribe({
            next: (newItem) => {
                if (newItem) {
                    const key = this.cache.getItemKey(newItem);
                    this._itemKeys.next(this._itemKeys.getValue().unshift(key));
                    sub.unsubscribe();
                }
            },
            error: () => {
                sub.unsubscribe();
            },
        });

        entityProxy.fetch();
    }

    /**
     * Refresh the list, clearExisiting data will clear the data before doing the request
     */
    public refresh(clearExistingData = true): Observable<any> {
        this.cache.queryCache.clearCache();
        this.setOptions(this._options, clearExistingData);
        return this.fetchNext(true);
    }

    protected abstract handleChanges(params: TParams, options: {});
    protected abstract fetchNextItems(): Observable<any>;
    protected abstract processResponse(response: any): any[];
    protected abstract hasMoreItems(): boolean;
    protected abstract queryCacheKey(): string;
    protected abstract putQueryCacheData(): any;
    protected abstract getQueryCacheData(queryCache: CachedKeyList): any;
}
