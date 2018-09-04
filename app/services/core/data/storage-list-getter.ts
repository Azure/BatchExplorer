import { Type } from "@angular/core";
import { ContinuationToken, ListGetter, ListGetterConfig, ServerError, Record } from "@batch-flask/core";
import { StorageClientService } from "app/services/storage/storage-client.service";
import { Observable, from, throwError } from "rxjs";
import { catchError, flatMap, map, share } from "rxjs/operators";

export interface StorageBaseParams {
    storageAccountId: string;
}

export interface StorageListResponse {
    data: any[];
    continuationToken?: string;
}

export interface StorageListConfig<TEntity extends Record<any>, TParams extends StorageBaseParams>
    extends ListGetterConfig<TEntity, TParams> {

    getData: (client: any, params: TParams, options: any, token: any) => Promise<StorageListResponse>;
}

export class StorageListGetter<TEntity extends Record<any>, TParams extends StorageBaseParams>
    extends ListGetter<TEntity, TParams> {

    private _getData: (client: any, params: TParams, options: any, token: any) => Promise<StorageListResponse>;

    constructor(
        type: Type<TEntity>,
        private storageClient: StorageClientService,
        config: StorageListConfig<TEntity, TParams>) {

        super(type, config);
        this._getData = config.getData;

    }

    protected list(params: TParams, options: any): Observable<any> {
        return this._clientProxy(params, options, null).pipe(
            flatMap((client) => {
                return from(client);
            }),
            map(response => this._processStorageResponse(response)),
            catchError((error) => {
                return throwError(ServerError.fromStorage(error));
            }),
            share(),
        );
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this._clientProxy(token.params, token.options, token.nextLink).pipe(
            flatMap((client) => {
                return from(client);
            }),
            map(response => this._processStorageResponse(response)),
            catchError((error) => {
                return throwError(ServerError.fromStorage(error));
            }),
            share(),
        );
    }

    private _processStorageResponse(response) {
        return {
            data: response.data,
            nextLink: response.continuationToken,
        };
    }

    private _clientProxy(params, options, nextLink) {
        return this.storageClient.getFor(params.storageAccountId).pipe(
            map((client) => {
                return this._getData(client, params, options, nextLink);
            }),
            share(),
        );
    }
}
