import { Type } from "@angular/core";
import { RequestOptions, Response, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { ArmHttpService } from "../../arm-http.service";
import { ListGetter, ListGetterConfig } from "./list-getter";
import { ContinuationToken, ListOptions } from "./list-options";

export interface ArmListConfig<TEntity, TParams> extends ListGetterConfig<TEntity, TParams> {
    uri: (params: TParams, options: any) => string;
}

export class ArmListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _provideUri: (params: TParams, options: any) => string;

    constructor(
        type: Type<TEntity>,
        private arm: ArmHttpService,
        config: ArmListConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;
    }

    protected list(params: TParams, options: ListOptions): Observable<any> {
        return this.arm.get(
            this._provideUri(params, options),
            this._requestOptions(options)).pipe(
                map(x => this._processArmResponse(x)),
                share(),
            );
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this.arm.get(token.nextLink).pipe(
            map(x => this._processArmResponse(x)),
            share(),
        );
    }

    private _processArmResponse(response: Response) {
        const body = response.json();
        return {
            data: body.value,
            nextLink: body.nextLink,
        };
    }

    private _requestOptions(options: ListOptions): RequestOptions {
        const search = new URLSearchParams();
        if (options.filter) {
            search.set("$filter", options.filter.toOData());
        }

        if (options.select) {
            search.set("$select", options.select);
        }

        if (options.maxResults) {
            search.set("$top", options.maxResults.toString());
        }

        for (const key of Object.keys(options.attributes)) {
            search.set(key, options.attributes[key]);
        }
        return new RequestOptions({
            search,
        });
    }
}
