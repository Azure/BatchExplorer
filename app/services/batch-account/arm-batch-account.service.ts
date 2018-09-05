import { Injectable, OnDestroy } from "@angular/core";
import { RequestOptions, Response, URLSearchParams } from "@angular/http";
import { BasicEntityGetter, DataCache, EntityView } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, BatchAccountAttributes, Subscription } from "app/models";
import { AccountPatchDto } from "app/models/dtos";
import { ArmResourceUtils, Constants } from "app/utils";
import { List } from "immutable";
import { BehaviorSubject, Observable, combineLatest, empty, forkJoin, of } from "rxjs";
import { expand, filter, flatMap, map, reduce, share } from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
import { SubscriptionService } from "../subscription.service";

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

@Injectable()
export class ArmBatchAccountService implements OnDestroy {
    public accounts: Observable<List<ArmBatchAccount>>;
    private _accounts = new BehaviorSubject<List<ArmBatchAccount>>(null);

    private _cache = new DataCache<ArmBatchAccount>();
    private _getter: BasicEntityGetter<ArmBatchAccount, ArmBatchAccountParams>;

    constructor(
        // private storage: LocalFileStorage,
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {
        this.accounts = this._accounts.pipe(filter(x => x !== null));

        this._getter = new BasicEntityGetter(ArmBatchAccount, {
            cache: () => this._cache,
            supplyData: ({ id }) => this._loadAccount(id),
        });
    }

    public ngOnDestroy() {
        this._accounts.complete();
    }

    public view(): EntityView<ArmBatchAccount, ArmBatchAccountParams> {
        return new EntityView({
            cache: () => this._cache,
            getter: this._getter,
        });
    }

    public get(accountId: string): Observable<ArmBatchAccount> {
        return this._getter.fetch({ id: accountId });
    }

    public getFromCache(accountId: string): Observable<ArmBatchAccount> {
        return this._getter.fetch({ id: accountId }, { cached: true });
    }
    public patch(accountId: string, properties: AccountPatchDto): Observable<any> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.patch(subscription, accountId, { properties: properties.toJS() });
            }),
        );
    }

    public putResourcGroup(sub: Subscription, resourceGroup: string, body: any) {
        const rgUri = this.getResoureGroupId(sub, resourceGroup);
        return this.azure.put(sub, rgUri, { body: body });
    }

    public create(sub: Subscription, resourceGroup: string, accountName: string, body: any): Observable<any> {
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

    public getAccountId(sub: Subscription, resourceGroup: string, accountName: string): string {
        const uriPrefix = this.getResoureGroupId(sub, resourceGroup);
        return `${uriPrefix}/providers/${batchProvider}/batchAccounts/${accountName}`;
    }

    public getResoureGroupId(sub: Subscription, resourceGroup: string): string {
        return `subscriptions/${sub.subscriptionId}/resourceGroups/${resourceGroup}`;
    }

    /**
     * Call nameAvailability api to get account conflict info per location
     * @param subscriptionId
     */
    public nameAvailable(name: string, subscription: Subscription, location: string): Observable<AvailabilityResult> {
        if (!name || !subscription || !location) {
            return of(null);
        }
        const uri = `subscriptions/${subscription.subscriptionId}/providers/${batchProvider}`
            + `/locations/${location}/checkNameAvailability`;
        return this.azure.post(subscription, uri, {
            name: name,
            type: batchResourceProvider,
        }).pipe(
            map(response => {
                return response.json();
            }),
        );
    }

    /**
     * Call quota api and resource api to get result of whether current subscription quota reached or not
     * @param subscription
     * @param location
     */
    public accountQuota(subscription: Subscription, location: string): Observable<QuotaResult> {
        if (!subscription || !location) {
            return of(null);
        }

        // get current subscription account quota
        const quotaUri = `subscriptions/${subscription.subscriptionId}/providers/${batchProvider}`
            + `/locations/${location}/quotas`;
        const getQuotaObs = this.azure.get(subscription, quotaUri).pipe(map(response => {
            return response.json();
        }));

        // get current batch accounts number
        const resourceUri = `/subscriptions/${subscription.subscriptionId}/resources`;
        const search = new URLSearchParams();
        search.set("$filter", `resourceType eq '${batchResourceProvider}' and location eq '${location}'`);
        const options = new RequestOptions({ search });
        const batchAccountObs = this.azure.get(subscription, resourceUri, options).pipe(
            expand(obs => {
                return obs.json().nextLink ?
                    this.azure.get(subscription, obs.json().nextLink, options) : empty();
            }),
            reduce((batchAccounts, response: Response) => {
                return [...batchAccounts, ...response.json().value];
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
        const search = new URLSearchParams();
        search.set("$filter", `resourceType eq '${batchResourceProvider}'`);
        const options = new RequestOptions({ search });

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, `/subscriptions/${subscriptionId}/resources`, options).pipe(
                    map(response => {
                        return List<ArmBatchAccount>(response.json().value.map((data) => {
                            return new ArmBatchAccount(Object.assign({}, data, { subscription }));
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
            flatMap((subscriptions) => {
                const accountObs = subscriptions.map((subscription) => {
                    return this.list(subscription.subscriptionId);
                }).toArray();

                return forkJoin(...accountObs);
            }),
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

    private _loadAccount(accountId: string): Observable<BatchAccountAttributes> {
        return this.subscriptionService.get(ArmResourceUtils.getSubscriptionIdFromResourceId(accountId)).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, accountId).pipe(
                    map(response => {
                        const data = response.json();
                        return this._createAccount(subscription, data);
                    }),
                );
            }),
            share(),
        );
    }

    private _createAccount(subscription: Subscription, data: any): BatchAccountAttributes {
        return { ...data, subscription };
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
