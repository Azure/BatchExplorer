import { Type } from "@angular/core";
import { EntityGetter, EntityGetterConfig, ServerError } from "@batch-flask/core";
import { StorageClientService } from "app/services/storage/storage-client.service";
import { Observable, from, throwError } from "rxjs";
import { catchError, flatMap, map, share } from "rxjs/operators";
import { StorageBaseParams } from "./storage-list-getter";

export interface StorageGetResponse {
    data: any;
}

export interface StorageEntityGetterConfig<TEntity, TParams extends StorageBaseParams>
    extends EntityGetterConfig<TEntity, TParams> {

    /**
     * Get function(usually call the client proxy)
     */
    getFn: (client: any, params: TParams) => Promise<StorageGetResponse>;
}

export class StorageEntityGetter<TEntity, TParams extends StorageBaseParams> extends EntityGetter<TEntity, TParams> {
    private _getMethod: (client: any, params: TParams) => Promise<StorageGetResponse>;

    constructor(
        type: Type<TEntity>,
        private storageClient: StorageClientService,
        config: StorageEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._getMethod = config.getFn;
    }

    protected getData(params: TParams): Observable<any> {
        return this.storageClient.getFor(params.storageAccountId).pipe(
            flatMap((client) => {
                return from(this._getMethod(client, params));
            }),
            map(x => x.data),
            catchError((error) => {
                return throwError(ServerError.fromStorage(error));
            }),
            share(),
        );
    }
}
