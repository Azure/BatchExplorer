import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { CachedKeyList, DataCache, RxListProxy } from "app/services/core";

export interface RxMockListProxyConfig<TParams, TEntity> {
    initialParams?: TParams;
    items: TEntity[] | ((params: TParams) => TEntity[]);
}

/**
 * Mock list proxy where you pass the list of data to return
 */
export class RxMockListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _loadedFirst = false;
    private _items: (params: TParams) => TEntity[];

    constructor(type: Type<TEntity>, config: RxMockListProxyConfig<TParams, TEntity>) {
        super(type, {
            initialParams: config.initialParams,
            cache: () => new DataCache<TEntity>(),
        });
        if (config.items instanceof Function) {
            this._items = config.items;
        } else {
            this._items = () => config.items as TEntity[];
        }
    }

    protected handleNewOptions(options: {}) {
        // Nothing todo
    }

    protected fetchNextItems(): Observable<any> {
        return Observable.of(this._items(this._params));
    }

    protected processResponse(response: any) {
        this._loadedFirst = true;
        return response;
    }

    protected hasMoreItems(): boolean {
        return !this._loadedFirst;
    }

    protected queryCacheKey(): string {
        return this._options.filter;
    }

    protected putQueryCacheData(): any {
        return this._loadedFirst;
    }

    protected getQueryCacheData(queryCache: CachedKeyList): any {
        this._loadedFirst = queryCache.data;
    }
}
