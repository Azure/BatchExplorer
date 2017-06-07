import { Type } from "@angular/core";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { ServerError } from "app/models";
import { HttpCode } from "app/utils/constants";
import { RxProxyBase, RxProxyBaseConfig } from "./rx-proxy-base";

export interface RxEntityProxyConfig<TParams, TEntity> extends RxProxyBaseConfig<TParams, TEntity> {
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
        super(type, config);
        this.params = config.initialParams || {} as TParams;
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
        this._tryToLoadFromCache();

        return this.fetchData({
            getData: () => {
                return this.getData();
            },
            next: (response: any) => {
                const key = this.newItem(response);
                this._itemKey.next(key);
            },
            error: (error: ServerError) => {
                // If there is a 404 delete the item from the cache as it doesn't exist anymore
                if (error.status === HttpCode.NotFound) {
                    this._itemKey.next(null);
                    const queryKey = this.params[this.cache.uniqueField];
                    this.cache.deleteItemByKey(queryKey);
                }
            },
        });
    }

    public refresh(): Observable<any> {
        return this.fetch();
    }

    protected pollRefresh() {
        return this.refresh();
    }

    protected abstract getData(): Observable<any>;

    /**
     * Try to see if the entity is already in the cache if so load it immediatelly.
     */
    private _tryToLoadFromCache() {
        const key = this._params[this._cache.uniqueField];
        if (this._cache.has(key)) {
            this._itemKey.next(key);
            this._status.next(LoadingStatus.Ready);
        }
    }
}

export function getOnceProxy<TEntity>(getProxy: RxEntityProxy<any, TEntity>): Observable<TEntity> {
    const obs = new AsyncSubject<TEntity>();

    getProxy.fetch().subscribe({
        next: () => {
            getProxy.item.first().subscribe((item: TEntity) => {
                if (item) {
                    obs.next(item);
                    obs.complete();
                    getProxy.dispose();
                }
            });
        },
        error: (e) => {
            obs.error(e);
            obs.complete();
        },
    });

    return obs.asObservable();
}
