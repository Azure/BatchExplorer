import { HttpParams } from "@angular/common/http";
import { Type } from "@angular/core";
import {
    ContinuationToken, HttpRequestOptions, ListGetter, ListGetterConfig, ListOptions, Record,
} from "@batch-flask/core";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { AADGraphHttpService } from "./aad-graph-http.service";

export interface AADGraphListConfig<TEntity extends Record<any>, TParams> extends ListGetterConfig<TEntity, TParams> {
    uri: (params: TParams, options: any) => string;
    filter?: (item: TEntity) => boolean;
}

export class AADGraphListGetter<TEntity extends Record<any>, TParams> extends ListGetter<TEntity, TParams> {
    private _filter: (item: TEntity) => boolean;
    private _provideUri: (params: TParams, options: any) => string;

    constructor(
        type: Type<TEntity>,
        private aadGraph: AADGraphHttpService,
        config: AADGraphListConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;
        this._filter = config.filter;
    }

    protected list(params: TParams, options: ListOptions): Observable<any> {
        return this.aadGraph.get<any>(
            this._provideUri(params, options),
            this._requestOptions(options)).pipe(
                map(x => this._processAADGraphResponse(x)),
                share());
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this.aadGraph.get<any>(token.nextLink).pipe(
            map(x => this._processAADGraphResponse(x)),
            share(),
        );
    }

    private _processAADGraphResponse(response: { value: TEntity[], "@odata.nextLink": string }) {
        let data = response.value;
        if (this._filter) {
            data = data.filter(this._filter);
        }
        return {
            data,
            nextLink: response["@odata.nextLink"],
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
            params = params.set("maxResults", options.maxResults.toString());
        }

        for (const key of Object.keys(options.attributes)) {
            params = params.set(key, options.attributes[key]);
        }

        return {
            params,
        };
    }
}
