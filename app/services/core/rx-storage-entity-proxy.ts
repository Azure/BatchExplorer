import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { StorageClientService } from "../storage-client.service";
import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

export interface RxStorageEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    /**
     * Get function(Ususally call the client proxy)
     */
    getFn: (client: any, params: TParams) => Promise<any>;

}

export class RxStorageEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _getMethod: (client: any, params: TParams) => Promise<any>;

    constructor(
        type: Type<TEntity>,
        private storageClient: StorageClientService,
        config: RxStorageEntityProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._getMethod = config.getFn;
    }

    protected getData(): Observable<any> {
        return this.storageClient.get().flatMap((client) => {
            return Observable.fromPromise(this._getMethod(client, this._params)).map(x => x.data).catch((error) => {
                return Observable.throw(ServerError.fromStorage(error));
            });
        }).share();
    }
}
