import { Type } from "@angular/core";
import { Observable } from "rxjs";

import { ArmHttpService } from "../arm-http.service";
import { AzureHttpService } from "../azure-http.service";
import { SubscriptionService } from "../subscription.service";
import { RxEntityProxy, RxEntityProxyConfig } from "./rx-entity-proxy";

function getSubscriptionIdFromAccountId(accountId: string) {
    const regex = /subscriptions\/(.*)\/resourceGroups/;
    const out = regex.exec(accountId);

    if (!out || out.length < 2) {
        return null;
    } else {
        return out[1];
    }
}

export interface RxArmEntityProxyConfig<TParams, TEntity> extends RxEntityProxyConfig<TParams, TEntity> {
    /**
     * Get function(usually call the client proxy)
     */
    uri: string | ((params: TParams) => string);

    /**
     * Need to provide the subscription service if using the AzureHttpService
     */
    subscriptionService?: SubscriptionService;
}

export class RxArmEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
    private _provideUri: string | ((params: TParams) => string);
    private _subscriptionService: SubscriptionService;

    constructor(
        type: Type<TEntity>,
        private http: ArmHttpService | AzureHttpService,
        config: RxArmEntityProxyConfig<TParams, TEntity>) {

        super(type, config);
        this._provideUri = config.uri;
        this._subscriptionService = config.subscriptionService;
    }

    protected getData(): Observable<any> {
        const uri = this._computeURI();
        if (this.http instanceof AzureHttpService) {
            return this._subscriptionService.get(getSubscriptionIdFromAccountId(uri))
                .flatMap((subscription) => {
                    return (this.http as AzureHttpService).get(subscription, uri)
                        .map(x => x.json());
                })
                .share();
        } else {
            return this.http.get(uri).map(x => x.json());
        }
    }

    private _computeURI(): string {
        if (this._provideUri instanceof String) {
            return this._provideUri;
        } else {
            return this._provideUri(this._params);
        }
    }
}
