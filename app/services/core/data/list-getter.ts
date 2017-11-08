import { Type } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { DataCache } from "app/services/core";
import { log } from "app/utils";
import { HttpCode } from "app/utils/constants";
import { GenericGetter, GenericGetterConfig } from "./generic-getter";

export interface ListGetterOptions {
    select?: string;
    filter?: string;
}

export interface ListGetterConfig<TEntity, TParams> extends GenericGetterConfig<TEntity, TParams> {
}

export abstract class ListGetter<TEntity, TParams> extends GenericGetter<TEntity, TParams>  {

    constructor(type: Type<TEntity>, config: ListGetterConfig<TEntity, TParams>) {
        super(type, config);
    }

    public fetch(params: TParams, options?: ListGetterOptions, forceNew?: boolean);
    public fetch(nextLink: string);
    public fetch(paramsOrNextLink: string | TParams, options: ListGetterOptions = {}, forceNew = false) {
        if (typeof paramsOrNextLink === "string") {
            this._fetchNext(paramsOrNextLink);
        } else {
            this._fetch(paramsOrNextLink, options, forceNew);
        }
    }

    protected abstract list(params: TParams, options: ListGetterOptions): Observable<TEntity[]>;
    protected abstract listNext(nextLink): Observable<TEntity[]>;

    private _fetch(params: TParams, options: ListGetterOptions, forceNew = false): Observable<List<TEntity>> {
        const cache = this.getCache(params);
        const items = this._tryLoadFromCache(cache, options, forceNew);
        if (items !== null) {
            return Observable.of(items);
        }

        return this.list(params, options).map(x => this._processItems(cache, x));
    }

    private _fetchNext(nextLink: string): Observable<List<TEntity>> {
        const cache = this.getCache(params);

        return this.listNext(nextLink).map(x => this._processItems(x));
    }

    private _processItems(cache: DataCache<TEntity>, data: any[], select?: string): List<TEntity> {
        const items = data.map(x => new this.type(x));
        cache.addItems(items, select);
        return List(items);
    }

    /**
     * This will try to load keys from the query cache
     * This succeed only if there is no item currently loaded, we don't want new data and there is cached data.
     */
    private _tryLoadFromCache(cache: DataCache<TEntity>, options: ListGetterOptions, forceNew: boolean): List<TEntity> {
        if (forceNew) {
            return null;
        }

        const cachedList = cache.queryCache.getKeys(options.filter);
        if (!cachedList) {
            return null;
        }

        return List(cachedList.keys.map(key => cache.get(key)));
    }
}
