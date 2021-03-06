import { Injectable, OnDestroy } from "@angular/core";
import { UserConfigurationService } from "@batch-flask/core";
import { StringUtils } from "@batch-flask/utils";
import {
    ArmSubscription, ArmSubscriptionAttributes, ResourceGroup, TenantDetails,
} from "app/models";
import { BEUserConfiguration, Constants } from "common";
import { List, Set } from "immutable";
import {
    AsyncSubject, BehaviorSubject, Observable, Subject, combineLatest,
    forkJoin, EMPTY, of
} from "rxjs";
import {
    catchError,
    distinctUntilChanged, expand, filter, first, map, mergeMap, publishReplay, reduce, refCount, shareReplay, switchMap, takeUntil,
} from "rxjs/operators";
import { AuthService, TenantAuthorization, TenantStatus } from "../aad";
import { AzureHttpService } from "../azure-http.service";
import { ArmListResponse } from "../core";

@Injectable({ providedIn: "root" })
export class SubscriptionService implements OnDestroy {
    public subscriptions: Observable<List<ArmSubscription>>;
    public accountSubscriptionFilter: Observable<Set<string>>;
    private _subscriptions = new BehaviorSubject<List<ArmSubscription>>(List([]));
    private _accountSubscriptionFilter = new BehaviorSubject<Set<string>>(Set([]));
    private _subscriptionsLoaded = new AsyncSubject();
    private _destroy = new Subject();

    constructor(
        private azure: AzureHttpService,
        private auth: AuthService,
        private settingsService: UserConfigurationService<BEUserConfiguration>
    ) {

        const ignoredPatterns = this.settingsService.watch("subscriptions").pipe(
            takeUntil(this._destroy),
            map((settings) => settings && settings.ignore || []),
            distinctUntilChanged(),
        );

        this.subscriptions = this._subscriptionsLoaded.pipe(
            mergeMap(() => combineLatest([
                this._subscriptions, ignoredPatterns
            ])),
            takeUntil(this._destroy),
            map(([subscriptions, ignoredPatterns]) => {
                return this._ignoreSubscriptions(subscriptions, ignoredPatterns);
            }),
            map((subscriptions) => {
                return subscriptions.sortBy(x => x.displayName && x.displayName.toLowerCase()).toList();
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
        const obs = this.auth.getTenantAuthorizations().pipe(
            filter(authorizations => authorizations.length > 0),
            switchMap((authorizations: TenantAuthorization[]) =>
                forkJoin(authorizations.map(authorization =>
                    this.loadTenantSubscriptions(authorization)
                        .pipe(catchError(error => of(error)))
                    )
                )
            ),
            publishReplay(1),
            refCount()
        );
        obs.subscribe({
            next: (tenantSubscriptions) => {
                const subscriptions = tenantSubscriptions.flatten();
                this._subscriptions.next(List(subscriptions));
                this._cacheSubscriptions();
                this._markSubscriptionsAsLoaded();
            }
        });
        return obs;
    }

    /**
     * Loads subscriptions for an authorized tenant.
     *
     * If the tenant is inactive, an empty list is returned.
     *
     * If the tenant is unauthorized, a notification is displayed, inviting the
     * user to configure their active tenants, and an empty list is returned.
     *
     * @param authorization The tenant authorization
     * @returns list of subscriptions
     */
    loadTenantSubscriptions(authorization: TenantAuthorization):
    Observable<ArmSubscription[]> {
        if (!authorization.active ||
            authorization.status === TenantStatus.failed) {
            return of([]);
        } else {
            return this._loadSubscriptionsForTenant(authorization.tenant);
        }
    }

    public setAccountSubscriptionFilter(subIds: Set<string>) {
        if (subIds.equals(this._accountSubscriptionFilter.value)) {
            return;
        }
        this._accountSubscriptionFilter.next(subIds);
        localStorage.setItem(
            Constants.localStorageKey.accountSubscriptionFilter,
            JSON.stringify(subIds.toJS())
        );
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
                return obs.nextLink ? this.azure.get(subscription, obs.nextLink) : EMPTY;
            }),
            reduce((resourceGroups, response: ArmListResponse<any>) => {
                return [...resourceGroups, ...response.value];
            }, []),
        );
    }

    private _loadSubscriptionsForTenant(tenant: TenantDetails):
        Observable<ArmSubscription[]> {
        return this.azure.get<ArmListResponse<ArmSubscriptionAttributes>>(
            tenant.tenantId, "subscriptions"
        ).pipe(
            expand(response => {
                if (response.nextLink) {
                    return this.azure.get(tenant.tenantId, response.nextLink);
                } else {
                    return EMPTY;
                }
            }),
            reduce((subs, response: ArmListResponse<any>) => {
                const newSubs = response.value.map(
                    sub => this._createSubscription(tenant, sub)
                );
                return [...subs, ...newSubs];
            }, [])
        );
    }

    private _createSubscription(tenant: TenantDetails, data: any): ArmSubscription {
        return new ArmSubscription({
            ...data,
            tenant,
            tenantId: tenant.tenantId
        });
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
