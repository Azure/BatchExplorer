import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { ListGetter, ListGetterConfig } from "app/services/core/data/list-getter";
import { StorageClientService } from "app/services/storage/storage-client.service";
import { ContinuationToken } from "./list-options";

export interface StorageBaseParams {
    storageAccountId: string;
}

export interface StorageListConfig<TEntity, TParams extends StorageBaseParams>
    extends ListGetterConfig<TEntity, TParams> {

    getData: (client: any, params: TParams, options: any, token: any) => any;
}

export class StorageListGetter<TEntity, TParams extends StorageBaseParams> extends ListGetter<TEntity, TParams> {
    private _getData: (client: any, params: TParams, options: any, token: any) => any;

    constructor(
        type: Type<TEntity>,
        private storageClient: StorageClientService,
        config: StorageListConfig<TEntity, TParams>) {

        super(type, config);
        this._getData = config.getData;

    }

    protected list(params: TParams, options: any): Observable<any> {
        return this._clientProxy(params, options, null).flatMap((client) => {
            return Observable.fromPromise(client);
        }).map(response => this._processStorageResponse(response)).catch((error) => {
            return Observable.throw(ServerError.fromStorage(error));
        }).share();
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this._clientProxy(null, token.options, token.nextLink).flatMap((client) => {
            return Observable.fromPromise(client);
        }).map(response => this._processStorageResponse(response)).catch((error) => {
            return Observable.throw(ServerError.fromStorage(error));
        }).share();
    }

    private _processStorageResponse(response) {
        return {
            data: response.data,
            nextLink: response.continuationToken,
        };
    }

    private _clientProxy(params, options, nextLink) {
        return this.storageClient.getFor(params.storageAccountId).map((client) => {
            return this._getData(client, params, options, nextLink);
        }).share();
    }
}
