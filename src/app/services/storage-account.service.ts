import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { StorageAccount, StorageAccountAttributes } from "app/models";
import { List } from "immutable";
import { Observable } from "rxjs";
import { flatMap, map, share } from "rxjs/operators";
import { AzureHttpService } from "./azure-http.service";
import { ArmListResponse } from "./core";
import { SubscriptionService } from "./subscription";

const STORAGE_ACCOUNT_TYPE_FILTER =
    "resourceType eq 'Microsoft.Storage/storageAccounts'" +
    "or resourceType eq 'Microsoft.ClassicStorage/storageAccounts'";

function getSubscriptionIdFromAccountId(accountId: string) {
    const regex = /subscriptions\/(.*)\/resourceGroups/;
    const out = regex.exec(accountId);

    if (!out || out.length < 2) {
        return null;
    } else {
        return out[1];
    }
}

@Injectable({ providedIn: "root" })
export class StorageAccountService {
    constructor(private azure: AzureHttpService, private subscriptionService: SubscriptionService) { }

    public get(accountId: string): Observable<StorageAccount> {
        return this.subscriptionService.get(getSubscriptionIdFromAccountId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.get<StorageAccountAttributes>(subscription, accountId).pipe(
                    map(response => new StorageAccount(response)),
                );
            }),
            share(),
        );
    }

    public findByName(subscriptionId: string, accountName: string): Observable<StorageAccount | null> {
        const params = new HttpParams().set("$filter", `name eq '${accountName}' and (${STORAGE_ACCOUNT_TYPE_FILTER})`);
        const options = { params };

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get<ArmListResponse<StorageAccountAttributes>>(
                    subscription, `/subscriptions/${subscriptionId}/resources`, options);
            }),
            map(response => {
                if (response.value.length === 1) {
                    return new StorageAccount(response.value[0]);
                } else {
                    return null;
                }
            }),
            share(),
        );
    }

    public list(subscriptionId: string): Observable<List<StorageAccount>> {
        const params = new HttpParams().set("$filter", STORAGE_ACCOUNT_TYPE_FILTER);
        const options = { params };

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get<ArmListResponse<StorageAccountAttributes>>(
                    subscription, `/subscriptions/${subscriptionId}/resources`, options);
            }),
            map(response => {
                return List(response.value.map((data) => {
                    return new StorageAccount(data);
                })) as any;
            }),
            share(),
        );
    }
}
