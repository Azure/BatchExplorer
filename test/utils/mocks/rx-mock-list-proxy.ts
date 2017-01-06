import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { CachedKeyList, DataCache, RxListProxy } from "app/services/core";

export interface RxMockListProxyConfig<TParams, TEntity> {
    items: TEntity[];
}

/**
 * Mock list proxy where you pass the list of data to return
 */
export class RxMockListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _loadedFirst = false;
    private _items: TEntity[];

    constructor(type: Type<TEntity>, config: RxMockListProxyConfig<TParams, TEntity>) {
        super(type, {
            cache: () => new DataCache<TEntity>(),
        });
        this._items = config.items;
    }

    protected handleNewOptions(options: {}) {
        // Nothing todo
    }

    protected fetchNextItems(): Observable<any> {
        return Observable.of(this._items);
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
