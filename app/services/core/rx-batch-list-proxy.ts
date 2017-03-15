import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { BatchClientService } from "app/services";
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
        const client = this._clientProxy();
        return Observable.fromPromise(client.fetchNext()).do(() => {
            this._nextLink = client.nextLink;
        }).catch((error) => {
            return Observable.throw(ServerError.fromBatch(error));
        });
    }

    protected processResponse(response: any) {
        return response.data;
    }

    protected hasMoreItems(): boolean {
        return this._clientProxy().hasMoreItems();
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
        const proxy = this._proxyConstructor(this.batchClient, this._params, this._computeOptions(this._options));
        proxy.nextLink = this._nextLink;
        return proxy;
    }
}
