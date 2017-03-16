import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { BatchClientService } from "../batch-client.service";
import { CachedKeyList } from "./query-cache";
import { RxListProxy, RxListProxyConfig } from "./rx-list-proxy";

const defaultOptions = {
    maxResults: 50,
};

export interface RxBatchListProxyConfig<TParams, TEntity> extends RxListProxyConfig<TParams, TEntity> {
    proxyConstructor: (client: any, params: TParams, options: any) => any;
    initialOptions?: any;
}

/**
 * List proxy implementation to use the batch client proxy
 */
export class RxBatchListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _nextLink = null;
    private _proxyConstructor: (client: any, params: TParams, options: any) => any;

    constructor(
        type: Type<TEntity>,
        private batchClient: BatchClientService,
        config: RxBatchListProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._proxyConstructor = config.proxyConstructor;
    }

    protected handleChanges(params: any, options: any) {
        // Nothing to do
    }

    protected fetchNextItems(): Observable<any> {
        return this._clientProxy().flatMap((client) => {
            console.log("Got here...", client);
            return Observable.fromPromise(client.fetchNext()).do(() => {
                this._nextLink = client.nextLink;
            }).catch((error) => {
                console.log("Error is", error);
                return Observable.throw(ServerError.fromBatch(error));
            });
        }).share();
    }

    protected processResponse(response: any) {
        return response.data;
    }

    protected hasMoreItems(): boolean {
        return this._nextLink !== null;
    }

    protected queryCacheKey(): string {
        return this._options.filter;
    }

    protected putQueryCacheData(): any {
        return this._nextLink;
    }

    protected getQueryCacheData(queryCache: CachedKeyList): any {
        this._nextLink = queryCache.data;
    }

    private _computeOptions(options: any) {
        return Object.assign({}, defaultOptions, options);
    }

    private _clientProxy() {
        return this.batchClient.get().map((client) => {
            const proxy = this._proxyConstructor(client, this._params, this._computeOptions(this._options));
            proxy.nextLink = this._nextLink;
            return proxy;
        }).share();
    }
}
