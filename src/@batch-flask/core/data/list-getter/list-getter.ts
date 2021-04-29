import { Type } from "@angular/core";
import { Record } from "@batch-flask/core/record";
import { List, OrderedSet } from "immutable";
import { Observable, empty, of } from "rxjs";
import { expand, map, reduce, share, switchMap } from "rxjs/operators";
import { DataCache } from "../data-cache";
import { GenericGetter, GenericGetterConfig } from "../generic-getter";
import { ContinuationToken, ListOptions, ListOptionsAttributes } from "../list-options";

export type FetchAllProgressCallback = (count: number) => void;

export interface ListResponse<TEntity> {
    items: List<TEntity>;
    nextLink: ContinuationToken | null;
}

export type ListGetterConfig<TEntity extends Record<any>, TParams> =
    GenericGetterConfig<TEntity, TParams>;

export abstract class ListGetter<TEntity extends Record<any>, TParams> extends GenericGetter<TEntity, TParams>  {

    constructor(type: Type<TEntity>, config: ListGetterConfig<TEntity, TParams>) {
        super(type, config);
    }

    public fetch(params: TParams, options?: ListOptionsAttributes | ListOptions, forceNew?: boolean)
        : Observable<ListResponse<TEntity>>;
    public fetch(nextLink: ContinuationToken): Observable<ListResponse<TEntity>>;
    public fetch(paramsOrNextLink: any, options: any = {}, forceNew = false): Observable<ListResponse<TEntity>> {
        if (paramsOrNextLink.nextLink) {
            return this._fetchNext(paramsOrNextLink);
        } else {
            return this._fetch(paramsOrNextLink, new ListOptions(options), forceNew);
        }
    }

    public fetchAll(
        params: TParams,
        options?: ListOptionsAttributes | ListOptions,
        progress?: FetchAllProgressCallback): Observable<List<TEntity>> {

        return this._fetch(params, new ListOptions(options), true).pipe(
            expand(({ items, nextLink }) => {
                return nextLink ? this._fetchNext(nextLink) : empty();
            }),
            reduce((items: TEntity[], response: ListResponse<TEntity>) => {
                const array = [...items, ...response.items.toArray()];
                if (progress) { progress(array.length); }
                return array;
            }, []),
            map(items => List(items)),
            share(),
        );
    }

    public fetchFromCache(params: TParams, options?: ListOptionsAttributes | ListOptions)
        : ListResponse<TEntity> | null {

        const cache = this.getCache(params);
        return this._tryLoadFromCache(cache, new ListOptions(options), false);
    }

    protected abstract list(params: TParams, options: ListOptionsAttributes): Observable<TEntity[]>;
    protected abstract listNext(token: ContinuationToken): Observable<TEntity[]>;

    private _fetch(params: TParams, options: ListOptions, forceNew = false): Observable<ListResponse<TEntity>> {
        const cache = this.getCache(params);
        const cachedResponse = this._tryLoadFromCache(cache, options, forceNew);
        if (cachedResponse !== null) {
            return of(cachedResponse);
        }

        return this.list(params, options).pipe(switchMap(x => this._processItems(cache, x, params, options, true)));
    }

    private _fetchNext(token: ContinuationToken): Observable<ListResponse<TEntity>> {
        const cache = this.getCache(token.params);
        return this.listNext(token).pipe(
            switchMap(x => this._processItems(cache, x, token.params, token.options, false)));
    }

    private _processItems(
        cache: DataCache<TEntity>,
        response: any,
        params: TParams,
        options: ListOptions,
        isFirstPage: boolean): Observable<ListResponse<TEntity>> {

        const { data, nextLink } = response;
        const items: TEntity[] = data.map(x => this._createItem(x, params));
        const keys: OrderedSet<string> = OrderedSet(cache.addItems(items, options.select));
        const token = {
            nextLink,
            params,
            options,
        };

        if (items.length !== 0 && isFirstPage) {
            cache.queryCache.cacheQuery(keys, token);
        } else if (items.length === 0 && !isFirstPage && nextLink) {
            return this._fetchNext(token);
        }
        return of({
            items: List(items),
            nextLink: nextLink && token,
        });
    }

    /**
     * This will try to load keys from the query cache
     * This succeed only if there is no item currently loaded, we don't want new data and there is cached data.
     */
    private _tryLoadFromCache(
        cache: DataCache<TEntity>,
        options: ListOptions,
        forceNew: boolean): ListResponse<TEntity> | null {
        if (forceNew) {
            return null;
        }

        const cachedList = cache.queryCache.getKeys(options.filter && options.filter.toOData(), options.select);

        if (!cachedList) {
            return null;
        }

        const items = List<TEntity>(cachedList.keys.map(key => cache.get(key!)));
        return {
            items,
            nextLink: cachedList.token,
        };
    }
}
