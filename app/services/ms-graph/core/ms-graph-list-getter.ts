import { HttpParams } from "@angular/common/http";
import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { HttpRequestOptions } from "@batch-flask/core";
import { ListGetter, ListGetterConfig } from "app/services/core/data/list-getter";
import { ContinuationToken, ListOptions } from "app/services/core/data/list-options";
import { MsGraphHttpService } from "./ms-graph-http.service";

export interface MsGraphListConfig<TEntity, TParams> extends ListGetterConfig<TEntity, TParams> {
    uri: (params: TParams, options: any) => string;
}

export class MsGraphListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _provideUri: (params: TParams, options: any) => string;

    constructor(
        type: Type<TEntity>,
        private msGraph: MsGraphHttpService,
        config: MsGraphListConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;
    }

    protected list(params: TParams, options: ListOptions): Observable<any> {
        return this.msGraph.get<any>(
            this._provideUri(params, options),
            this._requestOptions(options)).map(x => this._processMsGraphResponse(x)).share();
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this.msGraph.get<any>(token.nextLink).map(x => this._processMsGraphResponse(x)).share();
    }

    private _processMsGraphResponse(response: { value: TEntity[], "@odata.nextLink": string }) {
        return {
            data: response.value,
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
