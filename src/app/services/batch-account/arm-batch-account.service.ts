import { HttpParams } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { SanitizedError, log } from "@batch-flask/utils";
import { ArmBatchAccount, ArmSubscription } from "app/models";
import { AccountPatchDto } from "app/models/dtos";
import { ArmResourceUtils } from "app/utils";
import { Constants } from "common";
import { List } from "immutable";
import { BehaviorSubject, Observable, empty, forkJoin, of } from "rxjs";
import { expand, filter, flatMap, map, reduce, share, shareReplay, take } from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
import { ArmListResponse } from "../core";
import { SubscriptionService } from "../subscription";

const batchProvider = "Microsoft.Batch";
const batchResourceProvider = batchProvider + "/batchAccounts";

export interface AvailabilityResult {
    nameAvailable: boolean;
    reason?: string;
    message?: string;
}

export interface QuotaResult {
    used: number;
    quota: number;
}

export interface ArmBatchAccountListParams {
    subscriptionId: string;
}

export interface ArmBatchAccountParams {
    id: string;
}

export class ArmBatchAccountSubscriptionError extends SanitizedError {

}

@Injectable({ providedIn: "root" })
export class ArmBatchAccountService implements OnDestroy {
    public accounts: Observable<List<ArmBatchAccount>>;
    private _accounts = new BehaviorSubject<List<ArmBatchAccount>>(null);

    constructor(
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {
        this.accounts = this._accounts.pipe(filter(x => x !== null));
    }

    public ngOnDestroy() {
        this._accounts.complete();
    }

    public get(id: string): Observable<ArmBatchAccount> {
        const subscriptionId = ArmResourceUtils.getSubscriptionIdFromResourceId(id);
        if (!subscriptionId) {
            throw new ArmBatchAccountSubscriptionError(`Couldn't parse subscription id from batch account id ${id}`);
        }
        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                if (!subscription) {
                    throw new ServerError({
                        status: 404,
                        code: "SubscriptionNotFound",
                        message: `Subscription ${subscriptionId} is not found. You might not have permission anymore.`,
                    });
                }
                return this.azure.get(subscription, id).pipe(
                    map(response => this._createAccount(subscription, response)),
                );
            }),
            share(),
        );
    }

    public patch(accountId: string, properties: AccountPatchDto): Observable<any> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.patch(subscription, accountId, { properties: properties.toJS() });
            }),
        );
    }

    public putResourcGroup(sub: ArmSubscription, resourceGroup: string, body: any) {
        const rgUri = this.getResoureGroupId(sub, resourceGroup);
        return this.azure.put(sub, rgUri, { body: body });
    }

    public create(sub: ArmSubscription, resourceGroup: string, accountName: string, body: any): Observable<any> {
        const accountUri = this.getAccountId(sub, resourceGroup, accountName);
        return this.azure.put(sub, accountUri, { body: body });
    }

    public delete(accountId: string): Observable<any> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.delete(subscription, accountId);
            }),
        );
    }

    public getAccountId(sub: ArmSubscription, resourceGroup: string, accountName: string): string {
        const uriPrefix = this.getResoureGroupId(sub, resourceGroup);
        return `${uriPrefix}/providers/${batchProvider}/batchAccounts/${accountName}`;
    }

    public getResoureGroupId(sub: ArmSubscription, resourceGroup: string): string {
        return `subscriptions/${sub.subscriptionId}/resourceGroups/${resourceGroup}`;
    }

    /**
     * Call nameAvailability api to get account conflict info per location
     * @param subscriptionId
     */
    public nameAvailable(
        name: string,
        subscription: ArmSubscription,
        location: string,
    ): Observable<AvailabilityResult> {
        if (!name || !subscription || !location) {
            return of(null);
        }
        const uri = `subscriptions/${subscription.subscriptionId}/providers/${batchProvider}`
            + `/locations/${location}/checkNameAvailability`;
        return this.azure.post(subscription, uri, {
            name: name,
            type: batchResourceProvider,
        });
    }

    /**
     * Call quota api and resource api to get result of whether current subscription quota reached or not
     * @param subscription
     * @param location
     */
    public accountQuota(subscription: ArmSubscription, location: string): Observable<QuotaResult> {
        if (!subscription || !location) {
            return of(null);
        }

        // get current subscription account quota
        const quotaUri = `subscriptions/${subscription.subscriptionId}/providers/${batchProvider}`
            + `/locations/${location}/quotas`;
        const getQuotaObs = this.azure.get<any>(subscription, quotaUri);

        // get current batch accounts number
        const resourceUri = `/subscriptions/${subscription.subscriptionId}/resources`;
        const params = new HttpParams()
            .set("$filter", `resourceType eq '${batchResourceProvider}' and location eq '${location}'`);

        const options = { params };
        const batchAccountObs = this.azure.get<ArmListResponse<any>>(subscription, resourceUri, options).pipe(
            expand(obs => {
                return obs.nextLink ? this.azure.get(subscription, obs.nextLink, options) : empty();
            }),
            reduce((batchAccounts, response: ArmListResponse<any>) => {
                return [...batchAccounts, ...response.value];
            }, []),
        );

        return forkJoin([getQuotaObs, batchAccountObs]).pipe(
            map(results => {
                if (!results[0] || !Array.isArray(results[1])) {
                    return null;
                }
                return {
                    used: results[1].length,
                    quota: results[0].accountQuota,
                };
            }),
        );
    }

    public list(subscriptionId: string): Observable<List<ArmBatchAccount>> {
        const options = {};

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get<ArmListResponse<any>>(
                    subscription,
                    `/subscriptions/${subscriptionId}/providers/Microsoft.Batch/batchAccounts`, options).pipe(
                        map(response => {
                            return List<ArmBatchAccount>(response.value.map((data) => {
                                return new ArmBatchAccount({ ...data, subscription });
                            }));
                        }),
                    );
            }),
            share(),
        );
    }

    public load() {
        this._loadCachedAccounts();
        const obs = this.subscriptionService.subscriptions.pipe(
            take(1),
            flatMap((subscriptions) => {
                const accountObs = subscriptions.map((subscription) => {
                    return this.list(subscription.subscriptionId);
                }).toArray();

                return forkJoin(...accountObs);
            }),
            shareReplay(1),
        );

        obs.subscribe({
            next: (accountsPerSubscriptions) => {
                const accounts = accountsPerSubscriptions.map(x => x.toArray()).flatten();
                this._accounts.next(List(accounts));
                this._cacheAccounts();
            },
            error: (error) => {
                log.error("Error loading accounts", error);
            },
        });

        return obs;
    }

    private _createAccount(subscription: ArmSubscription, data: any): ArmBatchAccount {
        return new ArmBatchAccount({ ...data, subscription });
    }

    private _loadCachedAccounts() {
        const str = localStorage.getItem(Constants.localStorageKey.batchAccounts);

        try {
            const data = JSON.parse(str);

            if (data.length === 0) {
                this._clearCachedAccounts();
            } else {
                const accounts = data.map(x => new ArmBatchAccount(x));
                this._accounts.next(List(accounts));
            }
        } catch (e) {
            this._clearCachedAccounts();
        }
    }

    private _cacheAccounts() {
        localStorage.setItem(Constants.localStorageKey.batchAccounts, JSON.stringify(this._accounts.value.toJS()));
    }

    private _clearCachedAccounts() {
        localStorage.removeItem(Constants.localStorageKey.batchAccounts);
    }
}
