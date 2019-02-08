import { Injectable, OnDestroy } from "@angular/core";
import { UserConfigurationService } from "@batch-flask/core";
import { StringUtils, log } from "@batch-flask/utils";
import {
    ArmSubscription, ArmSubscriptionAttributes, ResourceGroup, TenantDetails,
} from "app/models";
import { BEUserConfiguration, Constants } from "common";
import { List, Set } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable, Subject, combineLatest, empty, forkJoin } from "rxjs";
import {
    distinctUntilChanged, expand, filter, first, flatMap, map,
    publishReplay, reduce, refCount, shareReplay, switchMap, takeUntil,
} from "rxjs/operators";
import { AdalService } from "../adal";
import { AzureHttpService } from "../azure-http.service";
import { ArmListResponse } from "../core";
import { TenantDetailsService } from "../tenant-details.service";

@Injectable({ providedIn: "root" })
export class SubscriptionService implements OnDestroy {
    public subscriptions: Observable<List<ArmSubscription>>;
    public accountSubscriptionFilter: Observable<Set<string>>;
    private _subscriptions = new BehaviorSubject<List<ArmSubscription>>(List([]));
    private _accountSubscriptionFilter = new BehaviorSubject<Set<string>>(Set([]));
    private _subscriptionsLoaded = new AsyncSubject();
    private _destroy = new Subject();

    constructor(
        private tenantDetailsService: TenantDetailsService,
        private azure: AzureHttpService,
        private adal: AdalService,
        private settingsService: UserConfigurationService<BEUserConfiguration>) {

        const ignoredPatterns = this.settingsService.watch("subscriptions").pipe(
            takeUntil(this._destroy),
            map((settings) => settings && settings.ignore || []),
            distinctUntilChanged(),
        );

        this.subscriptions = this._subscriptionsLoaded.pipe(
            flatMap(() => combineLatest(this._subscriptions, ignoredPatterns)),
            takeUntil(this._destroy),
            map(([subscriptions, ignoredPatterns]) => {
                return this._ignoreSubscriptions(subscriptions, ignoredPatterns);
            }),
            shareReplay(1),
        );

        this.accountSubscriptionFilter = this._accountSubscriptionFilter.asObservable();
        this._loadCachedSubscriptions();
        this._loadAccountSubscriptionFilter();

    }

    public ngOnDestroy() {
        this._subscriptions.complete();
        this._destroy.next();
        this._destroy.complete();
    }

    public load(): Observable<any> {
        const obs = this.adal.tenantsIds.pipe(
            filter(ids => ids.length > 0),
            first(),
            switchMap((tenantIds) => {
                return forkJoin(tenantIds.map(tenantId => this._loadSubscriptionsForTenant(tenantId)));
            }),
            publishReplay(1),
            refCount(),
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
    public get(subscriptionId: string): Observable<ArmSubscription> {
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
    public listResourceGroups(subscription: ArmSubscription): Observable<ResourceGroup[]> {
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

    private _loadSubscriptionsForTenant(tenantId: string): Observable<ArmSubscription[]> {
        return this.tenantDetailsService.get(tenantId).pipe(
            switchMap((tenantDetails) => {
                return this.azure.get<ArmListResponse<ArmSubscriptionAttributes>>(tenantId, "subscriptions").pipe(
                    expand((response) => {
                        if (response.nextLink) {
                            return this.azure.get(tenantId, response.nextLink);
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

    private _createSubscription(tenant: TenantDetails, data: any): ArmSubscription {
        return new ArmSubscription({ ...data, tenant, tenantId: tenant.id });
    }

    private _cacheSubscriptions() {
        localStorage.setItem(Constants.localStorageKey.subscriptions, JSON.stringify(this._subscriptions.value.toJS()));
    }

    private _loadCachedSubscriptions() {
        const str = localStorage.getItem(Constants.localStorageKey.subscriptions);

        try {
            const data = JSON.parse(str);
            const subscriptions = data.map(x => new ArmSubscription(x));

            if (Object.keys(subscriptions).length === 0) {
                localStorage.removeItem(Constants.localStorageKey.subscriptions);
            } else {
                this._subscriptions.next(List<ArmSubscription>(subscriptions));
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

    private _ignoreSubscriptions(
        subscriptions: List<ArmSubscription>,
        ignoredPatterns: string[],
    ): List<ArmSubscription> {
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
