import { Type } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { Observable, from, of } from "rxjs";

import { ListGetter, ListGetterConfig } from "app/services/core/data/list-getter";
import { map, share, catchError } from "rxjs/operators";

export interface MockStorageListConfig<TEntity, TParams> extends ListGetterConfig<TEntity, TParams> {
    getData: (params: TParams, options: any) => any;
}

export class MockStorageListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _getData: (params: TParams, options: any) => any;

    constructor(
        type: Type<TEntity>,
        config: MockStorageListConfig<TEntity, TParams>) {

        super(type, config);
        this._getData = config.getData;
    }

    protected list(params: TParams, options: any): Observable<any> {
        return from(this._getData(params, options)).pipe(
            map((response: any) => ({ data: response.data })),
            catchError((error) => {
                return Observable.throw(ServerError.fromStorage(error));
            }),
            share(),
        );
    }

    protected listNext(token: any): Observable<any> {
        return of(null);
    }
}
