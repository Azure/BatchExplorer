import { Type } from "@angular/core";
import { BatchServiceClient } from "azure-batch";
import { Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { BatchClientService } from "app/services/batch-client.service";
import { ListGetter, ListGetterConfig } from "./list-getter";
import { ContinuationToken, ListOptions } from "./list-options";

export interface BatchListConfig<TEntity, TParams> extends ListGetterConfig<TEntity, TParams> {
    list: (client: BatchServiceClient, params: TParams, options: any) => Promise<any[]>;
    listNext: (client: BatchServiceClient, nextLink: string) => Promise<any[]>;
}

export class BatchListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _list: (client: BatchServiceClient, params: TParams, options: ListOptions) => Promise<any[]>;
    private _listNext: (client: BatchServiceClient, nextLink: string) => Promise<any[]>;

    constructor(
        type: Type<TEntity>,
        private batchClient: BatchClientService,
        config: BatchListConfig<TEntity, TParams>) {

        super(type, config);
        this._list = config.list;
        this._listNext = config.listNext;
    }

    protected list(params: TParams, options: any): Observable<any> {
        options = { ...options };
        if (options.filter) {
            options.filter = options.filter.toOData();
        }
        return this.batchClient.get().flatMap((proxy) => {
            return Observable.fromPromise(this._list(proxy.client, params, options));
        }).map(x => this._processBatchResponse(x)).catch((error) => {
            return Observable.throw(ServerError.fromBatch(error));
        }).share();
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this.batchClient.get().flatMap((proxy) => {
            return Observable.fromPromise(this._listNext(proxy.client, token.nextLink));
        }).map(x => this._processBatchResponse(x)).catch((error) => {
            return Observable.throw(ServerError.fromBatch(error));
        }).share();
    }

    private _processBatchResponse(data) {
        return {
            data,
            nextLink: data.odatanextLink,
        };
    }
}
