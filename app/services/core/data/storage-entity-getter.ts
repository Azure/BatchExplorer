import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { EntityGetter, EntityGetterConfig } from "app/services/core/data/entity-getter";
import { StorageClientService } from "app/services/storage/storage-client.service";
import { StorageBaseParams } from "./storage-list-getter";

export interface StorageEntityGetterConfig<TEntity, TParams extends StorageBaseParams>
    extends EntityGetterConfig<TEntity, TParams> {

    /**
     * Get function(usually call the client proxy)
     */
    getFn: (client: any, params: TParams) => Promise<any>;
}
export class StorageEntityGetter<TEntity, TParams extends StorageBaseParams> extends EntityGetter<TEntity, TParams> {
    private _getMethod: (client: any, params: TParams) => Promise<any>;

    constructor(
        type: Type<TEntity>,
        private storageClient: StorageClientService,
        config: StorageEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._getMethod = config.getFn;
    }

    protected getData(params: TParams): Observable<any> {
        return this.storageClient.getFor(params.storageAccountId).flatMap((client) => {
            return Observable.fromPromise(this._getMethod(client, params));
        }).map(x => x.data)
            .catch((error) => {
                return Observable.throw(ServerError.fromStorage(error));
            }).share();
    }
}
