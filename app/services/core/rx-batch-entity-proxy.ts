import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

export interface RxBatchEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    /**
     * Get function(Ususally call the client proxy)
     */
    getFn: (params: TParams) => Promise<any>;

}

export class RxBatchEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _getMethod: (params: TParams) => Promise<any>;

    constructor(type: Type<TEntity>, config: RxBatchEntityProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._getMethod = config.getFn;
    }

    protected getData(): Observable<any> {
        return Observable.fromPromise(this._getMethod(this._params)).map(x => x.data);
    }
}
