import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { exists } from "app/utils";
import { StorageClientService } from "../storage-client.service";
import { CachedKeyList } from "./query-cache";
import { RxListProxy, RxListProxyConfig } from "./rx-list-proxy";

const defaultOptions = {
    maxResults: 50,
};

export interface RxStorageListProxyConfig<TParams, TEntity> extends RxListProxyConfig<TParams, TEntity> {
    proxyConstructor: (client: any, params: TParams, options: any) => any;
    initialOptions?: any;
}

/**
 * List proxy implementation to use the storage client proxy
 */
export class RxStorageListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _nextLink = null;
    private _loadedFirst = false;
    private _proxyConstructor: (client: any, params: TParams, options: any) => any;

    constructor(
        type: Type<TEntity>,
        private storageClient: StorageClientService,
        config: RxStorageListProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._proxyConstructor = config.proxyConstructor;
    }

    protected handleChanges(params: any, options: any) {
        this._loadedFirst = false;
    }

    protected fetchNextItems(): Observable<any> {
        return this._clientProxy().flatMap((client) => {
            return Observable.fromPromise(client).do(() => {
                this._nextLink = client.nextLink;
                // TODO: need to handle the continuation token somehow
                // nextLink is from BatchAPI, storage doesn't use this
            }).catch((error) => {
                return Observable.throw(ServerError.fromStorage(error));
            });
        }).share();
    }

    protected processResponse(response: any) {
        this._loadedFirst = true;
        return response.data;
    }

    protected hasMoreItems(): boolean {
        return !this._loadedFirst || exists(this._nextLink);
    }

    protected queryCacheKey(): string {
        return this._options.filter;
    }

    protected putQueryCacheData(): any {
        return this._nextLink;
    }

    protected getQueryCacheData(queryCache: CachedKeyList): any {
        this._loadedFirst = true;
        this._nextLink = queryCache.data;
    }

    private _computeOptions(options: any) {
        return Object.assign({}, defaultOptions, options);
    }

    private _clientProxy() {
        return this.storageClient.get().map((client) => {
            const proxy = this._proxyConstructor(client, this._params, this._computeOptions(this._options));
            proxy.nextLink = this._nextLink;
            proxy.loadedFirst = this._loadedFirst;

            return proxy;
        }).share();
    }
}
