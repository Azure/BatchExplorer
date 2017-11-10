import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ListGetter } from "app/services/core";
import { EntityGetterConfig } from "./entity-getter";

export interface BasicListGetterConfig<TEntity, TParams> extends EntityGetterConfig<TEntity, TParams> {
    supplyData: (params: TParams) => Observable<any[]>;
}
export class BasicListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _supplyData: (params: TParams) => Observable<any[]>;

    constructor(
        type: Type<TEntity>,
        config: BasicListGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._supplyData = config.supplyData;
    }

    protected list(params: TParams): Observable<any> {
        return this._supplyData(params);
    }

    protected listNext(params: TParams): Observable<any> {
        return this._supplyData(params);
    }
}
