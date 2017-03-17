import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable, AsyncSubject } from "rxjs";

import { Subscription } from "app/models";
import { log } from "app/utils";
import { AdalService } from "./adal";
import { AzureHttpService } from "./azure-http.service";

@Injectable()
export class SubscriptionService {
    public subscriptions: Observable<List<Subscription>>;
    private _subscriptions = new BehaviorSubject<List<Subscription>>(List([]));
    private _subscriptionsLoaded = new AsyncSubject();

    constructor(private azure: AzureHttpService, private adal: AdalService) {
        this.subscriptions = this._subscriptionsLoaded.flatMap(() => this._subscriptions.asObservable());
    }

    public load(): Observable<any> {
        const obs = this.adal.tenantsIds.filter(ids => ids.length > 0).first().flatMap((tenantIds) => {
            console.log("using tenantids", tenantIds);
            return Observable.combineLatest(tenantIds.map(tenantId => this._loadSubscriptionsForTenant(tenantId)));
        });
        obs.subscribe({
            next: (tenantSubscriptions) => {
                const subscriptions = tenantSubscriptions.flatten();
                console.log("SUbs", subscriptions, subscriptions.map(x => x.toJS()));
                this._subscriptions.next(List(subscriptions));
                this._subscriptionsLoaded.next(true);
                this._subscriptionsLoaded.complete();
            },
            error: (error) => {
                log.error("Error loading subscriptions", error);
            },
        });
        return obs;
    }

    public get(subscriptionId: string): Observable<Subscription> {
        console.log("Get for subId", subscriptionId);
        return this.subscriptions.first().map(subscriptions => {
            console.log("subscriptions", subscriptions.toJS());
            return subscriptions.filter(x => x.subscriptionId === subscriptionId).first();
        });
    }

    private _loadSubscriptionsForTenant(tenantId: string): Observable<Subscription[]> {
        return this.azure.get(tenantId, "subscriptions").map(response => {
            const subscriptionData = response.json().value;
            return subscriptionData.map(x => this._createSubscription(tenantId, x));
        });
    }

    private _createSubscription(tenantId: string, data: any): Subscription {
        return new Subscription(Object.assign({}, data, { tenantId }));
    }
}
