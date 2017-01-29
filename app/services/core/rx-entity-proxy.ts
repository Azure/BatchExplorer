import { Type } from "@angular/core";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { HttpCode } from "app/utils/constants";
import { DataCache } from "./data-cache";
import { RxProxyBase } from "./rx-proxy-base";

export interface RxEntityProxyConfig<TParams, TEntity> {
    /**
     *  Method that return the cache given the params.
     * This allow the use of targeted data cache which depends on some params.
     */
    cache: (params: TParams) => DataCache<TEntity>;

    /**
     * Initial set of params.
     */
    initialParams?: TParams;
}

export abstract class RxEntityProxy<TParams, TEntity> extends RxProxyBase<TParams, any, TEntity> {
    /**
     * Contains the observable of the item you want to load.
     * Subscribe to this or use the async pipe on this attribute.
     */
    public item: Observable<TEntity>;

    private _itemKey = new BehaviorSubject<string>(null);

    /**
     * @param _type Class for TEntity used to instantiate
     * @param _cache Cache for the model
     * @param _getMethod Method used to retrieve the data. THis should return a Promise
     * @param initialParams This is the initial values of params.
     */
    constructor(type: Type<TEntity>, config: RxEntityProxyConfig<TParams, TEntity>) {
        super(type, config.cache);
        this.params = config.initialParams || <TParams>{};
        this.item = this._itemKey.map((key) => {
            return this.cache.items.map((items) => {
                return items.get(key);
            });
        }).switch();
    }

    /**
     * Fetch the current item.
     */
    public fetch(): Observable<any> {
        return this.fetchData({
            getData: () => {
                return this.getData();
            },
            next: (response: any) => {
                const key = this.newItem(response);
                this._itemKey.next(key);
            },
            error: (error: any) => {
                // If there is a 404 delete the item from the cache as it doesn't exist anymore
                if (error.statusCode === HttpCode.NotFound) {
                    const queryKey = this.params[this.cache.uniqueField];
                    this.cache.deleteItemByKey(queryKey);
                }
            },
        });
    }

    public refresh(): Observable<any> {
        return this.fetch();
    }

    protected abstract getData(): Observable<any>;
}

export function getOnceProxy<TEntity>(getProxy: RxEntityProxy<any, TEntity>): Observable<TEntity> {
    const obs = new AsyncSubject<TEntity>();

    const errorCallback = (e) => {
        sub.unsubscribe();
        obs.error(e);
        obs.complete();
    };

    const sub = getProxy.item.subscribe({
        next: (item: TEntity) => {
            if (item) {
                sub.unsubscribe();
                obs.next(item);
                obs.complete();
            }
        },
        error: errorCallback,
    });
    getProxy.fetch().subscribe({
        error: errorCallback,
    });
    return obs.asObservable();
}
