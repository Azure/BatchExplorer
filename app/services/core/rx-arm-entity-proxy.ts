import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { AzureHttpService } from "../azure-http.service";
import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

export interface RxArmEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    /**
     * Get function(Ususally call the client proxy)
     */
    uri: string | ((params: TParams) => string);
}

export class RxArmEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _provideUri: string | ((params: TParams) => string);

    constructor(
        type: Type<TEntity>,
        private azure: AzureHttpService,
        config: RxArmEntityProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._provideUri = config.uri;
    }

    protected getData(): Observable<any> {
        return this.azure.get(this._computeURI()).map(x => x.json());
    }

    private _computeURI(): string {
        if (this._provideUri instanceof String) {
            return this._provideUri;
        } else {
            console.log("COmpute params", this._params);
            return this._provideUri(this._params);
        }
    }
}
