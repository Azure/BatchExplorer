import { Injectable } from "@angular/core";
import { List, Set } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { Subscription } from "app/models";
import { Constants, StringUtils, log } from "app/utils";
import { AdalService } from "./adal";
import { AzureHttpService } from "./azure-http.service";
import { SettingsService } from "./settings.service";

@Injectable()
export class SubscriptionService {
    public subscriptions: Observable<List<Subscription>>;
    public accountSubscriptionFilter: Observable<Set<string>>;
    private _subscriptions = new BehaviorSubject<List<Subscription>>(List([]));
    private _accountSubscriptionFilter = new BehaviorSubject<Set<string>>(Set([]));
    private _subscriptionsLoaded = new AsyncSubject();

    constructor(private azure: AzureHttpService, private adal: AdalService, private settingsService: SettingsService) {
        this.subscriptions = this._subscriptionsLoaded.flatMap(() => this._subscriptions.asObservable());
        this.accountSubscriptionFilter = this._accountSubscriptionFilter.asObservable();
        this._loadCachedSubscriptions();
        this._loadAccountSubscriptionFilter();
    }

    public load(): Observable<any> {
        const obs = this.adal.tenantsIds.filter(ids => ids.length > 0).first().flatMap((tenantIds) => {
            return Observable.combineLatest(tenantIds.map(tenantId => this._loadSubscriptionsForTenant(tenantId)));
        });
        obs.subscribe({
            next: (tenantSubscriptions) => {
                const subscriptions = tenantSubscriptions.flatten();

                this._subscriptions.next(List(this._filterIgnoredSubscriptions(subscriptions)));
                this._cacheSubscriptions();
                this._markSubscriptionsAsLoaded();
            },
            error: (error) => {
                log.error("Error loading subscriptions", error);
            },
        });
        return obs;
    }

    public setAccountSubscriptionFilter(subIds: Set<string>) {
        if (subIds.equals(this._accountSubscriptionFilter.value)) {
            return;
        }
        this._accountSubscriptionFilter.next(subIds);
        localStorage.setItem(Constants.localStorageKey.accountSubscriptionFilter, JSON.stringify(subIds.toJS()));
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
                this._subscriptions.next(List<Subscription>(this._filterIgnoredSubscriptions(subscriptions)));
                this._markSubscriptionsAsLoaded();
            }
        } catch (e) {
            this._clearCachedSubscriptions();
        }
    }

    private _loadAccountSubscriptionFilter() {
        const str = localStorage.getItem(Constants.localStorageKey.accountSubscriptionFilter);

        try {
            const data = JSON.parse(str);
            if (Array.isArray(data)) {
                this._accountSubscriptionFilter.next(Set(data));
            } else {
                localStorage.removeItem(Constants.localStorageKey.accountSubscriptionFilter);
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

    private _filterIgnoredSubscriptions(subscriptions: Subscription[]) {
        const ignored = this.settingsService.settings["subscription.ignore"];
        if (ignored.length === 0) {
            return subscriptions;
        }
        console.log("Ignired", ignored);
        return subscriptions.filter((subscription) => {
            console.log("Filter", subscription.displayName);
            for (let ignoredPattern of ignored) {
                if (StringUtils.matchWildcard(subscription.displayName, ignoredPattern)) {
                    return false;
                }
            }
            return true;
        });
    }
}
