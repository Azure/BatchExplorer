import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { DataCache } from "app/services/core/data-cache";
import { log } from "app/utils";
import { HttpCode } from "common/constants";
import { GenericGetter, GenericGetterConfig } from "./generic-getter";

export interface FetchOptions {
    cached?: boolean;
}

export interface EntityGetterConfig<TEntity, TParams> extends GenericGetterConfig<TEntity, TParams> {
}

const defaultFetchOptions = {
    cached: false,
};

export abstract class EntityGetter<TEntity, TParams> extends GenericGetter<TEntity, TParams>  {
    constructor(type: Type<TEntity>, config: EntityGetterConfig<TEntity, TParams>) {
        super(type, config);
    }

    public fetch(params: TParams, options: FetchOptions = {}): Observable<TEntity> {
        options = { ...defaultFetchOptions, ...options };
        const cache = this.getCache(params);

        if (options.cached) {
            const item = this._tryToLoadFromCache(cache, params);
            if (item) {
                return Observable.of(item);
            }
        }

        return this.getData(params).map((data) => {
            return this._processItem(cache, data);
        }).catch((error) => {
            this._processError(cache, params, error);
            return Observable.throw(error);
        }).share();
    }

    /**
     * Implement in the child class. This method is how to retrieve the data from the given params
     */
    protected abstract getData(params: TParams): Observable<any>;

    /**
     * Create a new item of type TEntity and adds it to the cache
     */
    private _processItem(cache: DataCache<TEntity>, data: any, select?: string): TEntity {
        const item = new this.type(data);
        cache.addItem(item, select);
        return item;
    }

    /**
     * Try to see if the entity is already in the cache if so load it immediatelly.
     */
    private _tryToLoadFromCache(cache: DataCache<TEntity>, params: TParams): TEntity {
        const key = params[cache.uniqueField];
        return cache.get(key);
    }

    private _processError(cache: DataCache<TEntity>, params: TParams, error: ServerError) {
        if (error.status === HttpCode.NotFound) {
            const queryKey = params[cache.uniqueField];
            if (queryKey) {
                cache.deleteItemByKey(queryKey);
            } else {
                const paramsString = Object.keys(params).join(",");
                // tslint:disable-next-line:max-line-length
                log.warn(`Unable to find unique key for cached item. Property: ${cache.uniqueField}, with params: ${paramsString}. The property must exist in the params collection.`);
            }
        }
    }
}
