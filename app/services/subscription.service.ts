import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { Subscription } from "app/models";
import { log } from "app/utils";
import { AdalService } from "./adal";
import { AzureHttpService } from "./azure-http.service";

@Injectable()
export class SubscriptionService {
    public subscriptions: Observable<List<Subscription>>;
    private _subscriptions = new BehaviorSubject<List<Subscription>>(List([]));

    constructor(private azure: AzureHttpService, private adal: AdalService) {
        this.subscriptions = this._subscriptions.asObservable();
    }

    public load(): Observable<any> {
        const obs = this.adal.tenantsIds.filter(ids => ids.length > 0).first().flatMap((tenantIds) => {
            console.log("using tenantids", tenantIds);
            return Observable.combineLatest(tenantIds.map(tenantId => this.azure.get(tenantId, "subscriptions")));
        });
        obs.subscribe({
            next: (tenantSubscriptions) => {
                const subscriptionsData = tenantSubscriptions.map(x => x.json().value).flatten();
                const subscriptions = subscriptionsData.map(x => new Subscription(x));
                console.log("SUbs", tenantSubscriptions.map(x => x.json()), subscriptionsData);
                this._subscriptions.next(List(subscriptions));
            },
            error: (error) => {
                log.error("Error loading subscriptions", error);
            },
        });
        return obs;
    }

    public get(subscriptionId: string): Observable<Subscription> {
        return this.subscriptions.first().map(subscriptions => {
            return subscriptions.filter(x => x.id === subscriptionId).first();
        });
    }
}
