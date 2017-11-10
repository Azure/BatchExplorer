import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ListGetter, ListGetterConfig } from "./list-getter";

export interface BasicListGetterConfig<TEntity, TParams> extends ListGetterConfig<TEntity, TParams> {
    supplyData: (params: TParams, nextLink?: string) => Observable<{ data: any[], nextLink?: string }>;
}

export class BasicListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _supplyData: (params: TParams, nextLink?: string) => Observable<{ data: any[], nextLink?: string }>;

    constructor(
        type: Type<TEntity>,
        config: BasicListGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._supplyData = config.supplyData;
    }

    protected list(params: TParams): Observable<any> {
        return this._supplyData(params);
    }

    protected listNext(nextLink: string): Observable<any> {
        return this._supplyData(null, nextLink);
    }
}
