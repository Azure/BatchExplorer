import { Type } from "@angular/core";
import { RequestOptions, Response } from "@angular/http";
import { Observable } from "rxjs";

import { ArmHttpService } from "../../arm-http.service";
import { ListGetter, ListGetterConfig } from "./list-getter";
import { ListOptions } from "./list-options";

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
            this._requestOptions(options)).map(x => this._processArmResponse(x)).share();
    }

    protected listNext(nextLink: string): Observable<any> {
        return this.arm.get(nextLink).map(x => this._processArmResponse(x)).share();
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
            search.set("$filter", options.filter);
        }

        if (options.select) {
            search.set("$select", options.select);
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
