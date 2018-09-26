import { Type } from "@angular/core";
import { ListGetter,  ListGetterConfig, Record, ServerError } from "@batch-flask/core";
import { Observable, from, of, throwError } from "rxjs";
import { catchError, map, share } from "rxjs/operators";

export interface MockStorageListConfig<TEntity extends Record<any>, TParams>
    extends ListGetterConfig<TEntity, TParams> {
    getData: (params: TParams, options: any) => any;
}

export class MockStorageListGetter<TEntity  extends Record<any>, TParams> extends ListGetter<TEntity, TParams> {
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
                return throwError(ServerError.fromStorage(error));
            }),
            share(),
        );
    }

    protected listNext(token: any): Observable<any> {
        return of(null);
    }
}
