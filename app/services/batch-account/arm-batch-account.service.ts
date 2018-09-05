import { Injectable } from "@angular/core";
import { RequestOptions, Response } from "@angular/http";
import { BasicEntityGetter, DataCache, EntityView } from "@batch-flask/core";
import { ArmBatchAccount, BatchAccountAttributes, Subscription } from "app/models";
import { AccountPatchDto } from "app/models/dtos";
import { ArmResourceUtils } from "app/utils";
import { Observable, empty, forkJoin, of } from "rxjs";
import { expand, flatMap, map, reduce, share } from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
// import { LocalFileStorage } from "../local-file-storage.service";
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
export class ArmBatchAccountService {
    public cache = new DataCache<ArmBatchAccount>();
    private _getter: BasicEntityGetter<ArmBatchAccount, ArmBatchAccountParams>;

    constructor(
        // private storage: LocalFileStorage,
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {

        this._getter = new BasicEntityGetter(ArmBatchAccount, {
            cache: () => this.cache,
            supplyData: ({ id }) => this._loadAccount(id),
        });
    }
    public view(): EntityView<ArmBatchAccount, ArmBatchAccountParams> {
        return new EntityView({
            cache: () => this.cache,
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
}
