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

export interface ContinuationToken {
    params: any;
    options: ListGetterOptions;
    nextLink: string;
}

export interface ListResponse<TEntity> {
    items: List<TEntity>;
    nextLink: ContinuationToken;
}

export interface ListGetterConfig<TEntity, TParams> extends GenericGetterConfig<TEntity, TParams> {
}

export abstract class ListGetter<TEntity, TParams> extends GenericGetter<TEntity, TParams>  {

    constructor(type: Type<TEntity>, config: ListGetterConfig<TEntity, TParams>) {
        super(type, config);
    }

    public fetch(params: TParams, options?: ListGetterOptions, forceNew?: boolean);
    public fetch(nextLink: ContinuationToken);
    public fetch(paramsOrNextLink: any, options: ListGetterOptions = {}, forceNew = false): Observable<ListResponse<TEntity>> {
        if (paramsOrNextLink.nextLink) {
            return this._fetchNext(paramsOrNextLink);
        } else {
            return this._fetch(paramsOrNextLink, options, forceNew);
        }
    }

    protected abstract list(params: TParams, options: ListGetterOptions): Observable<TEntity[]>;
    protected abstract listNext(nextLink): Observable<TEntity[]>;

    private _fetch(params: TParams, options: ListGetterOptions, forceNew = false): Observable<ListResponse<TEntity>> {
        const cache = this.getCache(params);
        const items = this._tryLoadFromCache(cache, options, forceNew);
        if (items !== null) {
            // TODO-TIM return real stuff
            return Observable.of(null);
        }

        return this.list(params, options).map(x => this._processItems(cache, x, params, options));
    }

    private _fetchNext(token: ContinuationToken): Observable<ListResponse<TEntity>> {
        const cache = this.getCache(token.params);

        return this.listNext(token.nextLink).map(x => this._processItems(cache, x, token.params, token.options));
    }

    private _processItems(
        cache: DataCache<TEntity>, response: any,
        params: TParams, options: ListGetterOptions): ListResponse<TEntity> {
        const { data, nextLink } = response;
        const items = data.map(x => new this.type(x));
        cache.addItems(items, options.select);
        return {
            items: List(items),
            nextLink: nextLink && {
                nextLink,
                params,
                options,
            },
        };
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
