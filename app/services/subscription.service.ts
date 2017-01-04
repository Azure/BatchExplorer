import { Injectable } from "@angular/core";

import { Subscription } from "app/models";
import { AzureHttpService } from "./azure-http.service";
import { RxListProxy } from "./core";


@Injectable()
export class SubscriptionService {
    constructor(private azure: AzureHttpService) {
    }

    /**
     * List the subscriptions of the current user
     */
    public list(): RxListProxy<{}, Subscription> {
        return null;
    }
}
