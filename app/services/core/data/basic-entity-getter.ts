import { Type } from "@angular/core";
import { EntityGetter, EntityGetterConfig } from "@batch-flask/core";
import { Observable } from "rxjs";

export interface BasicEntityGetterConfig<TEntity, TParams> extends EntityGetterConfig<TEntity, TParams> {
    /**
     * Get function(usually call the client proxy)
     */
    supplyData: (params: TParams) => any;
}

export class BasicEntityGetter<TEntity, TParams> extends EntityGetter<TEntity, TParams> {
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
