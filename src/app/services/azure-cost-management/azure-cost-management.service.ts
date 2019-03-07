import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, ArmSubscription } from "app/models";
import { ArmResourceUtils } from "app/utils";
import { DateTime } from "luxon";
import { Observable } from "rxjs";
import { map, share, switchMap, take, tap } from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
import { BatchAccountService } from "../batch-account";

export interface AzureCostEntry {
    preTaxCost: number;
    meter: string;
    date: Date;
    currency: string;
}

interface AzureCostAggregation {

}

interface AzureCostQuerySortConfiguration {
    direction: "ascending" | "descending";
    name: string;
}

interface AzureCostQueryGrouping {
    type: "Dimension" | "Tag";
    name: CostManagementDimensions;
}

interface QueryFilter {
    And?: QueryFilter[];
    Or?: QueryFilter[];
    Not?: QueryFilter;
    Dimensions?: {
        Name: string,
        Operator: "In" | "Eq",
        Values: string[],
    };
}

interface AzureCostQuery {
    type: string;
    dataSet: {
        granularity: string;
        aggregation: StringMap<AzureCostAggregation>;
        sorting: AzureCostQuerySortConfiguration[]
        grouping: AzureCostQueryGrouping[];
        filter?: QueryFilter;
    };
}

interface QueryResult {
    id: string;
    name: string;
    properties: {
        nextLink: string | null,
        columns: Array<{ name: string, type: string }>,
        rows: any[][],
    };

}

export enum CostManagementDimensions {
    ResourceId = "ResourceId",
    MeterSubCategory = "MeterSubCategory",
    MeterCategory = "MeterCategory",
    Meter = "Meter",
    ServiceName = "ServiceName",
    ServiceTier = "ServiceTier",
}

function costManagementUrl(scope: string) {
    return `${scope}/providers/Microsoft.CostManagement`;
}

@Injectable({ providedIn: "root" })
export class AzureCostManagementService {
    constructor(private accountService: BatchAccountService, private azure: AzureHttpService) { }

    public getCost(): Observable<AzureCostEntry[]> {
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
            switchMap((account: ArmBatchAccount) => this.getCostFor(account.subscription, account.id)),
        );
    }

    public getCostFor(subscription: ArmSubscription, accountId: string): Observable<AzureCostEntry[]> {
        const subId = ArmResourceUtils.getSubscriptionIdFromResourceId(accountId);
        const resourceGroup = ArmResourceUtils.getResourceGroupFromResourceId(accountId);
        const scope = `/subscriptions/${subId}/resourceGroups/${resourceGroup}`;
        const url = `${costManagementUrl(scope)}/query`;
        const payload = this._buildQuery(accountId);

        return this.azure.post<QueryResult>(subscription, url, payload).pipe(
            map(x => this._processQueryResponse(accountId, x)),
            share(),
        );
    }

    private _processQueryResponse(accountId: string, response: QueryResult): AzureCostEntry[] {
        const columnIndexes = {
            cost: null,
            date: null,
            resourceId: null,
            meterCategory: null,
            meterSubCategory: null,
            currency: null,
        };

        for (const [index, column] of response.properties.columns.entries()) {
            switch (column.name) {
                case "PreTaxCost":
                    columnIndexes.cost = index;
                    break;
                case "UsageDate":
                    columnIndexes.date = index;
                    break;
                case CostManagementDimensions.ResourceId:
                    columnIndexes.resourceId = index;
                    break;
                case CostManagementDimensions.MeterSubCategory:
                    columnIndexes.meterSubCategory = index;
                    break;
                case CostManagementDimensions.MeterCategory:
                    columnIndexes.meterCategory = index;
                    break;
                case "Currency":
                    columnIndexes.currency = index;
                    break;
            }
        }
        // Check we found all the columns
        for (const [key, index] of Object.entries(columnIndexes)) {
            if (index === null) {
                log.error(`Failed to retrieve column index for ${key}`, response.properties.columns);
                return [];
            }
        }

        return response.properties.rows.filter((row) => {
            // Filter empty meters
            return row[columnIndexes.meterCategory] !== ""
                || row[columnIndexes.meterSubCategory] !== ""
                || row[columnIndexes.resourceId]
                || row[columnIndexes.cost] !== 0;
        }).map((row) => {
            return {
                preTaxCost: row[columnIndexes.cost],
                date: this._parseDate(row[columnIndexes.date]),
                meter: `${row[columnIndexes.meterCategory]} (${row[columnIndexes.meterSubCategory]})`,
                currency: row[columnIndexes.currency],
                resourceId: row[columnIndexes.resourceId],
            };
        }).filter(entry => entry.resourceId.startsWith(accountId));
    }

    private _parseDate(date: number) {
        return DateTime.fromFormat(date.toString(), "yyyyLLdd").toJSDate();
    }

    private _buildQuery(accountId: string): AzureCostQuery {
        return {
            type: "Usage",
            dataSet: {
                granularity: "Daily",
                aggregation: {
                    totalCost: {
                        name: "PreTaxCost",
                        function: "Sum",
                    },
                },
                sorting: [
                    {
                        direction: "ascending",
                        name: "UsageDate",
                    },
                ],
                grouping: [
                    {
                        type: "Dimension",
                        name: CostManagementDimensions.ResourceId,
                    },
                    {
                        type: "Dimension",
                        name: CostManagementDimensions.MeterSubCategory,
                    },
                    {
                        type: "Dimension",
                        name: CostManagementDimensions.MeterCategory,
                    },
                ],
                // filter: {
                //     Dimensions: {
                //         Name: "ResourceId",
                //         Operator: "In",
                //         Values: [accountId],
                //     },
                // },
            },
        };
    }
}
