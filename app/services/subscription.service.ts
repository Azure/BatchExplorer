import { Injectable } from "@angular/core";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { Subscription } from "app/models";
import { Constants, log } from "app/utils";
import { AdalService } from "./adal";
import { AzureHttpService } from "./azure-http.service";

@Injectable()
export class SubscriptionService {
    public subscriptions: Observable<List<Subscription>>;
    private _subscriptions = new BehaviorSubject<List<Subscription>>(List([]));
    private _subscriptionsLoaded = new AsyncSubject();

    constructor(private azure: AzureHttpService, private adal: AdalService) {
        this.subscriptions = this._subscriptionsLoaded.flatMap(() => this._subscriptions.asObservable());
        this._loadCachedSubscriptions();
    }

    public load(): Observable<any> {
        const obs = this.adal.tenantsIds.filter(ids => ids.length > 0).first().flatMap((tenantIds) => {
            return Observable.combineLatest(tenantIds.map(tenantId => this._loadSubscriptionsForTenant(tenantId)));
        });
        obs.subscribe({
            next: (tenantSubscriptions) => {
                const subscriptions = tenantSubscriptions.flatten();
                this._subscriptions.next(List(subscriptions));
                this._cacheSubscriptions();
                this._markSubscriptionsAsLoaded();
            },
            error: (error) => {
                log.error("Error loading subscriptions", error);
            },
        });
        return obs;
    }

    /**
     * Get the subscription with the given object.
     * @param subscriptionId Id of the subscription(UUID)
     */
    public get(subscriptionId: string): Observable<Subscription> {
        return this.subscriptions.first().map(subscriptions => {
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

    private _cacheSubscriptions() {
        localStorage.setItem(Constants.localStorageKey.subscriptions, JSON.stringify(this._subscriptions.value.toJS()));
    }

    private _loadCachedSubscriptions() {
        const str = localStorage.getItem(Constants.localStorageKey.subscriptions);

        try {
            const data = JSON.parse(str);
            const subscriptions = data.map(x => new Subscription(x));

            if (Object.keys(subscriptions).length === 0) {
                localStorage.removeItem(Constants.localStorageKey.subscriptions);
            } else {
                this._subscriptions.next(List<Subscription>(subscriptions));
                this._markSubscriptionsAsLoaded();
            }
        } catch (e) {
            this._clearCachedSubscriptions();
        }
    }

    private _clearCachedSubscriptions() {
        localStorage.removeItem(Constants.localStorageKey.subscriptions);
    }

    private _markSubscriptionsAsLoaded() {
        this._subscriptionsLoaded.next(true);
        this._subscriptionsLoaded.complete();
    }
}
