import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

export interface RxBasicEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    /**
     * Get function(usually call the client proxy)
     */
    supplyData: (params: TParams) => any;
}

export class RxBasicEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _supplyData: (params: TParams) => any;

    constructor(
        type: Type<TEntity>,
        config: RxBasicEntityProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._supplyData = config.supplyData;
    }

    protected getData(): Observable<any> {
        return this._supplyData(this.params);
    }
}
