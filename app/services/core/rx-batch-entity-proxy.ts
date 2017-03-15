import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { BatchClientService } from "../batch-client.service";
import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

export interface RxBatchEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    /**
     * Get function(Ususally call the client proxy)
     */
    getFn: (client: any, params: TParams) => Promise<any>;

}

export class RxBatchEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _getMethod: (client: any, params: TParams) => Promise<any>;

    constructor(
        type: Type<TEntity>,
        private batchClient: BatchClientService,
        config: RxBatchEntityProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._getMethod = config.getFn;
    }

    protected getData(): Observable<any> {
        return this.batchClient.get().flatMap((client) => {
            return Observable.fromPromise(this._getMethod(client, this._params)).map(x => x.data).catch((error) => {
                return Observable.throw(ServerError.fromBatch(error));
            });
        }).share();
    }
}
