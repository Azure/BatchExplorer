import { HttpParams } from "@angular/common/http";
import { Type } from "@angular/core";
import {
    ContinuationToken, HttpRequestOptions, ListGetter, ListGetterConfig, ListOptions, Record,
} from "@batch-flask/core";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { AzureBatchHttpService } from "./batch-http.service";

export interface BatchListResponse<TEntity> {
    value: TEntity[];
    "odata.nextLink": string;
}

export interface BatchListConfig<TEntity extends Record<any>, TParams> extends ListGetterConfig<TEntity, TParams> {
    uri: (params: TParams, options: any) => string;
}

export class BatchListGetter<TEntity extends Record<any>, TParams> extends ListGetter<TEntity, TParams> {
    private _provideUri: (params: TParams, options: any) => string;

    constructor(
        type: Type<TEntity>,
        private http: AzureBatchHttpService,
        config: BatchListConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;
    }

    protected list(params: TParams, options: ListOptions): Observable<any> {
        return this.http.get<any>(
            this._provideUri(params, options),
            this._requestOptions(options)).pipe(
                map(x => this._processResponse(x)),
                share(),
            );
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this.http.get<any>(token.nextLink).pipe(
            map(x => this._processResponse(x)),
            share(),
        );
    }

    private _processResponse(response: BatchListResponse<TEntity>) {
        const data = response.value;

        return {
            data,
            nextLink: response["odata.nextLink"],
        };
    }

    private _requestOptions(options: ListOptions): HttpRequestOptions {
        let params = new HttpParams();
        if (options.filter) {
            params = params.set("$filter", options.filter.toOData());
        }

        if (options.select) {
            params = params.set("$select", options.select);
        }

        if (options.maxResults) {
            params = params.set("maxresults", options.maxResults.toString());
        }

        for (const key of Object.keys(options.attributes)) {
            params = params.set(key, options.attributes[key]);
        }
        return {
            params,
        };
    }
}
