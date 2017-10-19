import { Type } from "@angular/core";

import { ServerError } from "app/models";
import { BatchClientService } from "app/services";
import { BatchClientProxy } from "app/services/batch-api";
import { EntityGetter, EntityGetterConfig } from "app/services/core/data/entity-getter";
import { Observable } from "rxjs";

export interface BatchEntityGetterConfig<TEntity, TParams> extends EntityGetterConfig<TEntity, TParams> {
    /**
     * Get function(usually call the client proxy)
     */
    getFn: (client: BatchClientProxy, params: TParams) => Promise<any>;
}
export class BatchEntityGetter<TEntity, TParams> extends EntityGetter<TEntity, TParams> {
    private _getMethod: (client: BatchClientProxy, params: TParams) => Promise<any>;

    constructor(
        type: Type<TEntity>,
        private batchClient: BatchClientService,
        config: BatchEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._getMethod = config.getFn;
    }

    protected getData(params: TParams): Observable<any> {
        return this.batchClient.get().flatMap((client) => {
            // TODO-TIM flatten this
            return Observable.fromPromise(this._getMethod(client, params)).map(x => x.data).catch((error) => {
                return Observable.throw(ServerError.fromBatch(error));
            });
        }).share();
    }
}
