import { Type } from "@angular/core";
import { Record } from "@batch-flask/core/record";
import { Observable } from "rxjs";
import { EntityGetter, EntityGetterConfig } from "./entity-getter";

export interface BasicEntityGetterConfig<TEntity extends Record<any>, TParams>
    extends EntityGetterConfig<TEntity, TParams> {
    /**
     * Get function(usually call the client proxy)
     */
    supplyData: (params: TParams) => any;
}

export class BasicEntityGetter<TEntity extends Record<any>, TParams> extends EntityGetter<TEntity, TParams> {
    private _supplyData: (params: TParams) => any;

    constructor(
        type: Type<TEntity>,
        config: BasicEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._supplyData = config.supplyData;
    }

    protected getData(params: TParams): Observable<any> {
        return this._supplyData(params);
    }
}
