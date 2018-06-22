import { HttpResponse } from "@angular/common/http";
import { Type } from "@angular/core";
import { EntityGetter, EntityGetterConfig } from "app/services/core/data/entity-getter";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { AzureBatchHttpService } from "./batch-http.service";

export interface BatchEntityGetterConfig<TEntity, TParams> extends EntityGetterConfig<TEntity, TParams> {
    /**
     * Get function(usually call the client proxy)
     */
    uri: string | ((params: TParams) => string);

    processResponse?: (response: HttpResponse<any>, params: TParams) => any;
}
export class BatchEntityGetter<TEntity, TParams> extends EntityGetter<TEntity, TParams> {
    private _provideUri: string | ((params: TParams) => string);
    private _processResponse: (response: HttpResponse<any>, params: TParams) => any;

    constructor(
        type: Type<TEntity>,
        private http: AzureBatchHttpService,
        config: BatchEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;
        this._processResponse = config.processResponse;
    }

    protected getData(params: TParams): Observable<any> {
        const uri = this._computeURI(params);
        if (this._processResponse) {
            return this.http.get(uri, { observe: "response" }).pipe(
                map(x => this._processResponse(x, params)),
                share(),
            );
        }
        return this.http.get<TEntity>(uri);
    }

    private _computeURI(params: TParams): string {
        if (this._provideUri instanceof Function) {
            return this._provideUri(params);
        } else {
            return this._provideUri;
        }
    }
}
