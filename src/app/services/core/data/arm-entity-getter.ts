import { Type } from "@angular/core";
import { EntityGetter, EntityGetterConfig, Record } from "@batch-flask/core";
import { ArmHttpService } from "app/services/arm-http.service";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";

export interface ArmEntityGetterConfig<TEntity extends Record<any>, TParams>
    extends EntityGetterConfig<TEntity, TParams> {
    /**
     * Get function(usually call the client proxy)
     */
    uri: string | ((params: TParams) => string);
}
export class ArmEntityGetter<TEntity extends Record<any>, TParams> extends EntityGetter<TEntity, TParams> {
    private _provideUri: string | ((params: TParams) => string);

    constructor(
        type: Type<TEntity>,
        private arm: ArmHttpService,
        config: ArmEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._provideUri = config.uri;

    }

    protected getData(params: TParams): Observable<any> {
        return this.arm.get(this._computeURI(params)).pipe(
            map(x => x.json()),
            share(),
        );
    }

    private _computeURI(params: TParams): string {
        if (this._provideUri instanceof Function) {
            return this._provideUri(params);
        } else {
            return this._provideUri;
        }
    }
}
