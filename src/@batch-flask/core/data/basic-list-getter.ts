import { Type } from "@angular/core";
import { Observable } from "rxjs";
import { ListGetter, ListGetterConfig } from "./list-getter";
import { ContinuationToken, ListOptions } from "./list-options";

export interface BasicListGetterConfig<TEntity, TParams> extends ListGetterConfig<TEntity, TParams> {
    supplyData: (params: TParams, options: ListOptions, nextLink?: string)
        => Observable<{ data: any[], nextLink?: string }>;
}

export class BasicListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _supplyData: (params: TParams, options: ListOptions, nextLink?: string)
        => Observable<{ data: any[], nextLink?: string }>;

    constructor(
        type: Type<TEntity>,
        config: BasicListGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._supplyData = config.supplyData;
    }

    protected list(params: TParams, options: ListOptions): Observable<any> {
        return this._supplyData(params, options);
    }

    protected listNext(token: ContinuationToken): Observable<any> {
        return this._supplyData(null, null, token.nextLink);
    }
}
