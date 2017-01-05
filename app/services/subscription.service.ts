import { Injectable } from "@angular/core";

import { Subscription } from "app/models";
import { AzureHttpService } from "./azure-http.service";
import { DataCache, RxArmListProxy, RxListProxy } from "./core";

@Injectable()
export class SubscriptionService {
    public cache = new DataCache<Subscription>();

    constructor(private azure: AzureHttpService) {
    }

    /**
     * List the subscriptions of the current user
     */
    public list(): RxListProxy<{}, Subscription> {
        return new RxArmListProxy(Subscription, this.azure, {
            cache: () => this.cache,
            uri: () => "subscriptions",
            initialParams: {},
            initialOptions: {},
        });
    }
}
