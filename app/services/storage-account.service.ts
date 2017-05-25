import { Injectable } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { AzureHttpService } from "./azure-http.service";
import { SubscriptionService } from "./subscription.service";

export class StorageAccount {
    constructor(public data: any) {
    }
}

function getSubscriptionIdFromAccountId(accountId: string) {
    const regex = /subscriptions\/(.*)\/resourceGroups/;
    const out = regex.exec(accountId);

    if (!out || out.length < 2) {
        return null;
    } else {
        return out[1];
    }
}

@Injectable()
export class StorageAccountService {
    constructor(private azure: AzureHttpService, private subscriptionService: SubscriptionService) { }

    public get(accountId: string): Observable<StorageAccount> {
        return this.subscriptionService.get(getSubscriptionIdFromAccountId(accountId))
            .flatMap((subscription) => {
                return this.azure.get(subscription, accountId)
                    .map(response => {
                        const data = response.json();
                        return new StorageAccount(data);
                    });
            })
            .share();
    }

    public list(subscriptionId: string, options: any = {}) {
        return this.subscriptionService.get(subscriptionId)
            .flatMap((subscription) => {
                return this.azure.get(subscription, `/subscriptions/${subscriptionId}/resources`, options)
                    .map(response => {
                        return List(response.json().value.map((data) => {
                            return new StorageAccount(data);
                        }));
                    });
            })
            .share();
    }
}
