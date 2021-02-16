import { Type } from "@angular/core";
import { HttpCode } from "@batch-flask/core/constants";
import { Record } from "@batch-flask/core/record";
import { ServerError } from "@batch-flask/core/server-error";
import { log } from "@batch-flask/utils";
import { Observable, of, throwError } from "rxjs";
import { catchError, map, share } from "rxjs/operators";
import { DataCache } from "../data-cache";
import { GenericGetter, GenericGetterConfig } from "../generic-getter";

export interface FetchOptions {
    cached?: boolean;
}

export interface EntityGetterConfig<TEntity extends Record<any>, TParams>
    extends GenericGetterConfig<TEntity, TParams> {
}

const defaultFetchOptions = {
    cached: false,
};

export abstract class EntityGetter<TEntity extends Record<any>, TParams> extends GenericGetter<TEntity, TParams>  {
    constructor(type: Type<TEntity>, config: EntityGetterConfig<TEntity, TParams>) {
        super(type, config);
    }

    public fetch(params: TParams, options: FetchOptions = {}): Observable<TEntity> {
        options = { ...defaultFetchOptions, ...options };
        const cache = this.getCache(params);

        if (options.cached) {
            const item = this._tryToLoadFromCache(cache, params);
            if (item) {
                return of(item);
            }
        }

        return this.getData(params).pipe(
            map((data) => {
                return this._processItem(cache, data, params);
            }),
            catchError((error) => {
                this._processError(cache, params, error);
                return throwError(error);
            }),
            share(),
        );
    }

    /**
     * Implement in the child class. This method is how to retrieve the data from the given params
     */
    protected abstract getData(params: TParams): Observable<any>;

    /**
     * Create a new item of type TEntity and adds it to the cache
     */
    private _processItem(cache: DataCache<TEntity>, data: any, params: TParams, select?: string): TEntity {
        const item = this._createItem(data, params);
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
                // eslint-disable-next-line max-len

                log.warn(`Unable to find unique key for cached item ${this.type.name}. `
                    + `Cache key is: ${cache.uniqueField}, with params: ${paramsString}. `
                    + `The property must exist in the params collection.`, { params });
            }
        }
    }
}
