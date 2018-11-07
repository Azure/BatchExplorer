import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { ArmBatchAccount, Subscription } from "app/models";
import { AzureHttpService } from "app/services";
import { BatchAccountService } from "app/services/batch-account";
import { ArmListResponse } from "app/services/core";
import { Observable, empty } from "rxjs";
import { expand, reduce, switchMap, take, tap } from "rxjs/operators";

function consumptionUrl(subscriptionId: string) {
    return `subscriptions/${subscriptionId}/providers/Microsoft.Consumption`;
}

export interface ConsumptionMeterDetails {
    meterCategory: string;
    meterLocation: string;
    meterName: string;
    meterSubCategory: string;
    pretaxStandardRate: number;
    serviceName: string;
    serviceTier: string;
    totalIncludedQuantity: number;
    unit: string;
}

export interface UsageDetail {
    id: string;
    name: string;
    properties: {
        accountName: string;
        additionalProperties: string;
        billableQuantity: string;
        billingPeriodId: string;
        chargesBilledSeparately: string;
        consumedService: string;
        costCenter: string;
        currency: string;
        departmentName: string;
        instanceId: string;
        instanceLocation: string;
        instanceName: string;
        invoiceId: string;
        isEstimated: string;
        location: string;
        meterDetails: ConsumptionMeterDetails;
        meterId: string;
        offerId: string;
        partNumber: string;
        pretaxCost: number;
        product: string;
        resourceGuid: string;
        subscriptionGuid: string;
        subscriptionName: string;
        usageEnd: string;
        usageQuantity: number;
        usageStart: string;
        tags: any;
        type: string;
    };
}

@Injectable()
export class UsageDetailsService {
    constructor(private accountService: BatchAccountService, private azure: AzureHttpService) { }

    public getUsage(): Observable<UsageDetail[]> {
        return this.accountService.currentAccount.pipe(
            take(1),
            tap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    throw new ServerError({
                        code: "LocalBatchAccount",
                        message: "Cannot get quotas for a local batch account",
                        status: 406,
                    });
                }
            }),
            switchMap((account: ArmBatchAccount) => this.getUsageFor(account.subscription, account.id)),
        );
    }

    public getUsageFor(subscription: Subscription, accountId: string): Observable<UsageDetail[]> {
        const url = `${consumptionUrl(subscription.subscriptionId)}/usageDetails`;
        const filter = `properties/instanceId eq '${accountId}'`;
        const options = {
            params: new HttpParams()
                .set("$filter", filter)
                .set("$expand", `properties/additionalProperties,properties/meterDetails`),
        };

        return this.azure.get<ArmListResponse<UsageDetail>>(subscription, url, options).pipe(
            expand((response: ArmListResponse<UsageDetail>) => {
                return response.nextLink ? this.azure.get(subscription, response.nextLink, options) : empty();
            }),
            reduce((batchAccounts, response: ArmListResponse<any>) => {
                return [...batchAccounts, ...response.value];
            }, []),
        );
    }
}
