import { Type } from "@angular/core";
import { RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs";

import { exists } from "app/utils";
import { ArmHttpService } from "../arm-http.service";
import { CachedKeyList } from "./query-cache";
import { RxListProxy, RxListProxyConfig } from "./rx-list-proxy";

export interface RxArmListProxyConfig<TParams, TEntity> extends RxListProxyConfig<TParams, TEntity> {
    uri: (params: TParams, options: any) => string;
}

export class RxArmListProxy<TParams, TEntity> extends RxListProxy<TParams, TEntity> {
    private _provideUri: (params: TParams, options: any) => string;
    private _loadedFirst = false;
    private _nextLink = null;

    constructor(type: Type<TEntity>, private arm: ArmHttpService, config: RxArmListProxyConfig<TParams, TEntity>) {
        super(type, config);
        this._provideUri = config.uri;
    }

    protected handleChanges(params: any, options: {}) {
        this._nextLink = null;
        this._loadedFirst = false;
    }

    protected fetchNextItems(): Observable<any> {
        if (this._nextLink) {
            return this.arm.get(this._nextLink);
        } else {
            return this.arm.get(
                this._provideUri(this._params, this._options),
                this._requestOptions());
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
        this._loadedFirst = true;
        this._nextLink = queryCache.data;
    }

    private _requestOptions(): RequestOptions {
        const options = this._options;
        const search = new URLSearchParams();
        if (options.filter) {
            search.set("$filter", this._options.filter);
        }

        if (options.select) {
            search.set("$select", this._options.select);
        }

        if (options.maxResults) {
            search.set("maxResults", options.maxResults.toString());
        }

        for (let key of Object.keys(options.attributes)) {
            search.set(key, options.attributes[key]);
        }

        return new RequestOptions({
            search,
        });
    }
}
