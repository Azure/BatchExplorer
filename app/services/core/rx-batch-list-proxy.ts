import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { CachedKeyList } from "./query-cache";
import { RxListProxy, RxListProxyConfig } from "./rx-list-proxy";

const defaultOptions = {
    maxResults: 50,
};

export interface RxBatchListProxyConfig<TParams, TEntity> extends RxListProxyConfig<TParams, TEntity> {
    proxyConstructor: (params: TParams, options: any) => any;
    initialOptions?: any;
}

/**
 * List proxy implementation to use the batch client proxy
 */
export class RxBatchListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _proxyConstructor: (params: TParams, options: any) => any;
    private _clientProxy: any;

    constructor(type: Type<TEntity>, config: RxBatchListProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._proxyConstructor = config.proxyConstructor;
        this._clientProxy = config.proxyConstructor(this._params, this._computeOptions(this._options));
    }

    protected handleNewOptions(options: any) {
        this._clientProxy = this._proxyConstructor(this.params, this._computeOptions(options));
    }

    protected fetchNextItems(): Observable<any> {
        return Observable.fromPromise(this._clientProxy.fetchNext());
    }

    protected processResponse(response: any) {
        return response.data;
    }

    protected hasMoreItems(): boolean {
        return this._clientProxy.hasMoreItems();
    }

    protected queryCacheKey(): string {
        return this._options.filter;
    }

    protected putQueryCacheData(): any {
        return this._clientProxy.clone();
    }

    protected getQueryCacheData(queryCache: CachedKeyList): any {
        this._clientProxy = queryCache.data;
    }

    private _computeOptions(options: any) {
        return Object.assign({}, defaultOptions, options);
    }
}
