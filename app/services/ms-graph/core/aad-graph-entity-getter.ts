import { Type } from "@angular/core";
import { EntityGetter, EntityGetterConfig, Record } from "@batch-flask/core";
import { Observable } from "rxjs";
import { AADGraphHttpService } from "./aad-graph-http.service";

export interface AADGraphEntityGetterConfig<TEntity extends Record<any>, TParams>
    extends EntityGetterConfig<TEntity, TParams> {
    /**
     * Get function(usually call the client proxy)
     */
    uri: string | ((params: TParams) => string);
}
export class AADGraphEntityGetter<TEntity extends Record<any>, TParams> extends EntityGetter<TEntity, TParams> {
    private _provideUri: string | ((params: TParams) => string);

    constructor(
        type: Type<TEntity>,
        private aadGraph: AADGraphHttpService,
        config: AADGraphEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;

    }

    protected getData(params: TParams): Observable<any> {
        return this.aadGraph.get<TEntity>(this._computeURI(params));
    }

    private _computeURI(params: TParams): string {
        if (this._provideUri instanceof Function) {
            return this._provideUri(params);
        } else {
            return this._provideUri;
        }
    }
}
