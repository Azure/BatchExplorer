import { HttpParams } from "@angular/common/http";
import { Type } from "@angular/core";
import {
    ContinuationToken, HttpRequestOptions, ListGetter, ListGetterConfig, ListOptions, Record,
} from "@batch-flask/core";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { ArmHttpService } from "../../arm-http.service";

export interface ArmListResponse<TEntity = any> {
    value: TEntity[];
    nextLink: string;
}

export interface ArmListConfig<TEntity extends Record<any>, TParams> extends ListGetterConfig<TEntity, TParams> {
    uri: (params: TParams, options: any) => string;
}

export class ArmListGetter<TEntity extends Record<any>, TParams> extends ListGetter<TEntity, TParams> {
    private _provideUri: (params: TParams, options: any) => string;

    constructor(
        type: Type<TEntity>,
        private arm: ArmHttpService,
        config: ArmListConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;
    }

    protected list(params: TParams, options: ListOptions): Observable<any> {
        return this.arm.get<ArmListResponse<TEntity>>(
            this._provideUri(params, options),
            this._requestOptions(options)).pipe(
                map(x => ({ data: x.value, nextLink: x.nextLink })),
                share(),
            );
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this.arm.get<ArmListResponse<TEntity>>(token.nextLink).pipe(
            map(x => ({ data: x.value, nextLink: x.nextLink })),
            share(),
        );
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
            params = params.set("$top", options.maxResults.toString());
        }

        for (const key of Object.keys(options.attributes)) {
            params = params.set(key, options.attributes[key]);
        }
        return { params };
    }
}
