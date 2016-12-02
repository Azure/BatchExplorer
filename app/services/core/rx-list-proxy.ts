import { Type } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { DataCache } from "./data-cache";
import { RxEntityProxy } from "./rx-entity-proxy";
import { RxProxyBase } from "./rx-proxy-base";

const defaultOptions = {
    maxResults: 50,
};

export interface RxListProxyConfig<TParams, TEntity> {
    cache: (params: TParams) => DataCache<TEntity>;
    proxyConstructor: (params: TParams, options: any) => any;
    initialOptions?: any;
    initialParams?: any;
}

export class RxListProxy<TParams, TEntity> extends RxProxyBase<TParams, TEntity> {
    public items: Observable<List<TEntity>>;
    public hasMore: Observable<boolean>;

    private _itemKeys: BehaviorSubject<List<string>> = new BehaviorSubject(List([]));
    private _hasMore: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _proxyConstructor: (params: TParams, options: any) => any;
    private _clientProxy: any;
    private _options: any;

    constructor(type: Type<TEntity>, config: RxListProxyConfig<TParams, TEntity>) {
        super(type, config.cache);
        this._options = config.initialOptions || {};
        this.params = config.initialParams;
        this._proxyConstructor = config.proxyConstructor;
        this._clientProxy = config.proxyConstructor(this._params, this.computeOptions(this._options));
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

    public setOptions(options: {}) {
        this._options = options;
        this._clientProxy = this._proxyConstructor(this.params, this.computeOptions(options));
        this._itemKeys.next(List([]));
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
                this._clientProxy = cachedList.clientProxy;
                this._itemKeys.next(cachedList.keys);
                return Observable.from(cachedList.keys.toJS());
            }
        }

        return this.fetchData({
            getData: () => {
                return Observable.fromPromise(this._clientProxy.fetchNext());
            }, next: (response: any) => {
                this._hasMore.next(this._clientProxy.hasMoreItems());
                const keys = List(this.newItems(response.data));
                const currentKeys = this._itemKeys.getValue();
                if (currentKeys.size === 0) {
                    this.cache.queryCache.cacheQuery(this._options.filter, keys, this._clientProxy.clone());
                }
                this._itemKeys.next(List<string>(currentKeys.concat(keys)));
            },
            error: (error) => {
                this._itemKeys.error(error);
            },
        });

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

    public refresh(): Observable<any> {
        this.cache.queryCache.clearCache();
        this.setOptions(this._options);
        return this.fetchNext(true);
    }

    private computeOptions(options: any) {
        return Object.assign({}, defaultOptions, options);
    }
}
