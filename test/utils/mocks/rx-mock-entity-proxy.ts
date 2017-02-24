import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { DataCache, RxEntityProxy } from "app/services/core";

export interface RxMockEntityProxyConfig<TParams, TEntity> {
    initialParams?: TParams;
    cacheKey?: string;
    item: TEntity;
}

/**
 * Mock entity proxy where you pass in the entity you want to return
 */
export class RxMockEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _item: TEntity;

    constructor(type: Type<TEntity>, config: RxMockEntityProxyConfig<TParams, TEntity>) {
        super(type, {
            initialParams: config.initialParams,
            cache: () => new DataCache<TEntity>(config.cacheKey || "id"),
        });

        // console.log((config.item as any).toJS());
        this._item = config.item as TEntity;
    }

    public fetch(): Observable<TEntity> {
        console.log("returning", this._processItem(this._item));
        return Observable.of(this._processItem(this._item));
    }

    public refresh(): Observable<TEntity> {
        return this.fetch();
    }

    protected getData(): Observable<TEntity> {
        return this.fetch().catch((error) => {
            return Observable.throw(ServerError.fromBatch(error));
        });
    }

    private _processItem(item: TEntity) {
        if ((item as any).toJS) {
            return (item as any).toJS();
        } else {
            return item;
        }
    }
}
