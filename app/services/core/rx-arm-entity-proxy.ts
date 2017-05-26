import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ArmHttpService } from "../arm-http.service";
import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

export interface RxArmEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    /**
     * Get function(usually call the client proxy)
     */
    uri: string | ((params: TParams) => string);
}

export class RxArmEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _provideUri: string | ((params: TParams) => string);

    constructor(
        type: Type<TEntity>,
        private arm: ArmHttpService,
        config: RxArmEntityProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._provideUri = config.uri;
    }

    protected getData(): Observable<any> {
        return this.arm.get(this._computeURI())
            .map(x => x.json());
    }

    private _computeURI(): string {
        if (this._provideUri instanceof String) {
            return this._provideUri;
        } else {
            return this._provideUri(this._params);
        }
    }
}
