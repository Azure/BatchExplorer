import { Type } from "@angular/core";
import { RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs";

import { ObjectUtils, exists } from "app/utils";
import { AzureHttpService } from "../azure-http.service";
import { CachedKeyList } from "./query-cache";
import { RxListProxy, RxListProxyConfig } from "./rx-list-proxy";

export interface RxArmListProxyConfig<TParams, TEntity> extends RxListProxyConfig<TParams, TEntity> {
    uri: (params: TParams, options: any) => string;
}

export class RxArmListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _provideUri: (params: TParams, options: any) => string;
    private _loadedFirst = false;
    private _nextLink = null;

    constructor(type: Type<TEntity>, private azure: AzureHttpService, config: RxArmListProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._provideUri = config.uri;
    }

    protected handleChanges(params: any, options: {}) {
        this._nextLink = null;
        this._loadedFirst = false;
    }

    protected fetchNextItems(): Observable<any> {
        if (this._nextLink) {
            return this.azure.get(this._nextLink);
        } else {
            return this.azure.get(this._provideUri(this._params, this._options), this._requestOptions());
        }
    }

    protected processResponse(response: any) {
        const body = response.json();
        this._loadedFirst = true;
        this._nextLink = body.nextLink;
        return body.value;
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
        this._nextLink = queryCache.data;
    }

    private _requestOptions(): RequestOptions {
        const search = new URLSearchParams();
        if (this._options.filter) {
            search.set("$filter", this._options.filter);
        }
        if (this._options.select) {
            search.set("$select", this._options.select);
        }

        for (let key of Object.keys(ObjectUtils.except(this._options, ["filter"]))) {
            search.set(key, this._options[key]);
        }

        return new RequestOptions({
            search,
        });

    }
}
