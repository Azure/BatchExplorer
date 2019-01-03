import { Injectable } from "@angular/core";
import { StringUtils, log } from "@batch-flask/utils";
import {
    Location, LocationAttributes, ResourceGroup, Subscription, SubscriptionAttributes, TenantDetails,
} from "app/models";
import { Constants } from "common";
import { List, Set } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable, combineLatest, empty } from "rxjs";
import { expand, filter, first, flatMap, map, reduce, shareReplay } from "rxjs/operators";
import { AdalService } from "./adal";
import { AzureHttpService } from "./azure-http.service";
import { ArmListResponse } from "./core";
import { SettingsService } from "./settings.service";
import { TenantDetailsService } from "./tenant-details.service";

@Injectable({providedIn: "root"})
export class SubscriptionService {
    public subscriptions: Observable<List<Subscription>>;
    public accountSubscriptionFilter: Observable<Set<string>>;
    private _subscriptions = new BehaviorSubject<List<Subscription>>(List([]));
    private _accountSubscriptionFilter = new BehaviorSubject<Set<string>>(Set([]));
    private _subscriptionsLoaded = new AsyncSubject();
    private _ignoredSubscriptionPatterns = new BehaviorSubject<string[]>([]);

    constructor(
        private tenantDetailsService: TenantDetailsService,
        private azure: AzureHttpService,
        private adal: AdalService,
        private settingsService: SettingsService) {
        this.subscriptions = this._subscriptionsLoaded.pipe(
            flatMap(() => combineLatest(this._subscriptions, this._ignoredSubscriptionPatterns)),
            map(([subscriptions, ignoredPatterns]) => {
                return this._ignoreSubscriptions(subscriptions, ignoredPatterns);
            }),
            shareReplay(1),
        );

        this.accountSubscriptionFilter = this._accountSubscriptionFilter.asObservable();
        this._loadCachedSubscriptions();
        this._loadAccountSubscriptionFilter();

        this.settingsService.settingsObs.subscribe((newSettings) => {
            const ignoredPatterns = newSettings["subscription.ignore"];
            if (this._ignoredSubscriptionPatterns.value !== ignoredPatterns) {
                this._ignoredSubscriptionPatterns.next(ignoredPatterns);
            }
        });
    }

    public load(): Observable<any> {
        const obs = this.adal.tenantsIds.pipe(
            filter(ids => ids.length > 0),
            first(),
            flatMap((tenantIds) => {
                return combineLatest(tenantIds.map(tenantId => this._loadSubscriptionsForTenant(tenantId)));
            }),
        );
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
        return this.subscriptions.pipe(
            first(),
            map(subscriptions => {
                return subscriptions.filter(x => x.subscriptionId === subscriptionId).first();
            }),
        );
    }

    /**
     * Recursively list the resource groups for given subscription id
     * @param subscriptionId
     */
    public listResourceGroups(subscription: Subscription): Observable<ResourceGroup[]> {
        const uri = `subscriptions/${subscription.subscriptionId}/resourcegroups`;
        return this.azure.get<ArmListResponse>(subscription, uri).pipe(
            expand(obs => {
                return obs.nextLink ? this.azure.get(subscription, obs.nextLink) : empty();
            }),
            reduce((resourceGroups, response: ArmListResponse<any>) => {
                return [...resourceGroups, ...response.value];
            }, []),
        );
    }

    /**
     * List all available geo-locations for given subscription id
     * @param subscriptionId
     */
    public listLocations(subscription: Subscription): Observable<Location[]> {
        const uri = `subscriptions/${subscription.subscriptionId}/locations`;
        return this.azure.get<ArmListResponse<LocationAttributes>>(subscription, uri).pipe(
            map(response => response.value.map(x => new Location(x))),
        );
    }

    private _loadSubscriptionsForTenant(tenantId: string): Observable<Subscription[]> {
        return this.tenantDetailsService.get(tenantId).pipe(
            flatMap((tenantDetails) => {
                return this.azure.get<ArmListResponse<SubscriptionAttributes>>(tenantId, "subscriptions").pipe(
                    expand(response => {
                        if (response.nextLink) {
                            this.azure.get(tenantId, response.nextLink);
                        } else {
                            return empty();
                        }
                    }),
                    reduce((subs, response: ArmListResponse<any>) => {
                        const newSubs = response.value.map(x => this._createSubscription(tenantDetails, x));
                        return [...subs, ...newSubs];
                    }, []),
                );
            }),
        );
    }

    private _createSubscription(tenant: TenantDetails, data: any): Subscription {
        return new Subscription({ ...data, tenant, tenantId: tenant.id });
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

    private _ignoreSubscriptions(subscriptions: List<Subscription>, ignoredPatterns: string[]): List<Subscription> {
        if (ignoredPatterns.length === 0) {
            return subscriptions;
        }
        return List(subscriptions.filter((subscription) => {
            for (const ignoredPattern of ignoredPatterns) {
                if (StringUtils.matchWildcard(subscription.displayName, ignoredPattern, false)) {
                    return false;
                }
            }
            return true;
        }));
    }
}
