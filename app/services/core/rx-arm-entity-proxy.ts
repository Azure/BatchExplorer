import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { Subscription } from "app/models";
import { AzureHttpService } from "../azure-http.service";
import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

export interface RxArmEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    subscription: Subscription | Observable<Subscription>,

    /**
     * Get function(Ususally call the client proxy)
     */
    uri: string | ((params: TParams) => string);
}

export class RxArmEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _provideUri: string | ((params: TParams) => string);
    private _subscription: Observable<Subscription>;

    constructor(
        type: Type<TEntity>,
        private azure: AzureHttpService,
        config: RxArmEntityProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._provideUri = config.uri;
        if (config.subscription instanceof Observable) {
            this._subscription = config.subscription;
        } else {
            this._subscription = Observable.of(config.subscription);
        }
    }

    protected getData(): Observable<any> {
        return this._subscription.first()
            .flatMap(subscription => this.azure.get(subscription, this._computeURI()))
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
