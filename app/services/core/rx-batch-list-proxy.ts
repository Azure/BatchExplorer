import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { exists } from "app/utils";
import { BatchClientService } from "../batch-client.service";
import { ListOptions } from "./list-options";
import { RxListProxy, RxListProxyConfig } from "./rx-list-proxy";

const defaultOptions = new ListOptions({
    pageSize: 50,
});

export interface RxBatchListProxyConfig<TParams, TEntity> extends RxListProxyConfig<TParams, TEntity> {
    proxyConstructor: (client: any, params: TParams, options: any) => any;
    initialOptions?: any;
}

/**
 * List proxy implementation to use the batch client proxy
 */
export class RxBatchListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _nextLink = null;
    private _loadedFirst = false;
    private _proxyConstructor: (client: any, params: TParams, options: any) => any;

    constructor(
        type: Type<TEntity>,
        private batchClient: BatchClientService,
        config: RxBatchListProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._proxyConstructor = config.proxyConstructor;
    }

    protected handleChanges(params: any, options: any) {
        this._nextLink = null;
        this._loadedFirst = false;
    }

    protected fetchNextItems(): Observable<any> {
        return this._clientProxy().flatMap((client) => {
            return Observable.fromPromise(client.fetchNext()).do((data) => {
                console.log("Got data", data);
                this._nextLink = client.nextLink;
            }).catch((error) => {
                return Observable.throw(ServerError.fromBatch(error));
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

    private _computeOptions(options: ListOptions) {
        const newOptions = options.mergeDefault(defaultOptions);
        const attributes = newOptions.attributes;

        if (newOptions.maxResults) {
            attributes.maxResults = newOptions.maxResults;
        }
        if (newOptions.select) {
            attributes.select = newOptions.select;
        }
        if (newOptions.filter) {
            attributes.filter = newOptions.filter;
        }
        return attributes;
    }

    private _clientProxy() {
        return this.batchClient.get().map((client) => {
            const proxy = this._proxyConstructor(client, this._params, this._computeOptions(this._options));
            proxy.nextLink = this._nextLink;
            proxy.loadedFirst = this._loadedFirst;
            return proxy;
        }).share();
    }
}
