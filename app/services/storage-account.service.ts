import { Injectable } from "@angular/core";
import { RequestOptions, URLSearchParams } from "@angular/http";
import { List } from "immutable";
import { Observable } from "rxjs";
import { StorageAccount } from "app/models";
import { AzureHttpService } from "./azure-http.service";
import { SubscriptionService } from "./subscription.service";
import { map, flatMap, share } from "rxjs/operators";

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
        return this.subscriptionService.get(getSubscriptionIdFromAccountId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, accountId).pipe(
                    map(response => {
                        const data = response.json();
                        return new StorageAccount(data);
                    }),
                );
            }),
            share(),
        );
    }

    public list(subscriptionId: string): Observable<List<StorageAccount>> {
        const search = new URLSearchParams();
        search.set("$filter",
            "resourceType eq 'Microsoft.Storage/storageAccounts'" +
            "or resourceType eq 'Microsoft.ClassicStorage/storageAccounts'");
        const options = new RequestOptions({ search });

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, `/subscriptions/${subscriptionId}/resources`, options).pipe(
                    map(response => {
                        return List(response.json().value.map((data) => {
                            return new StorageAccount(data);
                        })) as any;
                    }),
                );
            }),
            share(),
        );
    }
}
