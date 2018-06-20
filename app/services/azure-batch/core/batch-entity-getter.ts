import { Type } from "@angular/core";

import { EntityGetter, EntityGetterConfig } from "app/services/core/data/entity-getter";
import { Observable } from "rxjs";
import { AzureBatchHttpService } from "./batch-http.service";

export interface BatchEntityGetterConfig<TEntity, TParams> extends EntityGetterConfig<TEntity, TParams> {
    /**
     * Get function(usually call the client proxy)
     */
    uri: string | ((params: TParams) => string);
}
export class BatchEntityGetter<TEntity, TParams> extends EntityGetter<TEntity, TParams> {
    private _provideUri: string | ((params: TParams) => string);

    constructor(
        type: Type<TEntity>,
        private http: AzureBatchHttpService,
        config: BatchEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;
    }

    protected getData(params: TParams): Observable<any> {
        return this.http.get<TEntity>(this._computeURI(params));
    }

    private _computeURI(params: TParams): string {
        if (this._provideUri instanceof Function) {
            return this._provideUri(params);
        } else {
            return this._provideUri;
        }
    }
}
