import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { TimeRange } from "@batch-flask/ui";
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
    date: Date;
    currency: string;
}

export type BatchAccountCost = StringMap<AzureCostEntry[]>;

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
    timeframe?: "Custom" | "MonthToDate" | "TheLastMonth" | "TheLastWeek";
    timePeriod?: {
        from: string;
        to: string;
    };
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

    public getCost(timeRange: TimeRange): Observable<BatchAccountCost> {
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
            switchMap((account: ArmBatchAccount) => this.getCostFor(account.subscription, account.id, timeRange)),
        );
    }

    public getCostFor(
        subscription: ArmSubscription, accountId: string, timeRange: TimeRange,
    ): Observable<BatchAccountCost> {

        const subId = ArmResourceUtils.getSubscriptionIdFromResourceId(accountId);
        const resourceGroup = ArmResourceUtils.getResourceGroupFromResourceId(accountId);
        const scope = `/subscriptions/${subId}/resourceGroups/${resourceGroup}`;
        const url = `${costManagementUrl(scope)}/query`;
        const payload = this._buildQuery(timeRange);

        return this.azure.post<QueryResult>(subscription, url, payload).pipe(
            map(x => this._processQueryResponse(accountId, x)),
            share(),
        );
    }

    private _processQueryResponse(accountId: string, response: QueryResult): BatchAccountCost {
        const columnIndexes = {
            cost: null,
            date: null,
            resourceId: null,
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
                case "Currency":
                    columnIndexes.currency = index;
                    break;
            }
        }

        // Check we found all the columns
        for (const [key, index] of Object.entries(columnIndexes)) {
            if (index === null) {
                log.error(`Failed to retrieve column index for ${key}`, response.properties.columns);
                return {};
            }
        }

        const rows = response.properties.rows.filter((row) => {
            // Filter empty meters
            return row[columnIndexes.resourceId]
                || row[columnIndexes.cost] !== 0;
        }).map((row) => {
            return {
                preTaxCost: row[columnIndexes.cost],
                date: row[columnIndexes.date],
                currency: row[columnIndexes.currency],
                resourceId: row[columnIndexes.resourceId],
            };
        }).filter(entry => entry.resourceId.toLowerCase().startsWith(accountId.toLowerCase()));

        return this._buildResponseFromRows(rows);
    }

    private _buildResponseFromRows(rows: Array<{
        date: number, preTaxCost: number, currency: string, resourceId: string,
    }>) {
        const poolMap: StringMap<{ [key: number]: AzureCostEntry }> = {};
        const days = new Set<number>();
        for (const row of rows) {
            const poolId = ArmResourceUtils.getAccountNameFromResourceId(row.resourceId);
            if (!(poolId in poolMap)) {
                poolMap[poolId] = {};
            }
            if (!days.has(row.date)) {
                days.add(row.date);
            }
            poolMap[poolId][row.date] = {
                preTaxCost: row.preTaxCost,
                date: this._parseDate(row.date),
                currency: row.currency,
            };
        }
        for (const map of Object.values(poolMap)) {
            for (const day of days) {
                if (!(day in map)) {
                    map[day] = {
                        preTaxCost: 0,
                        date: this._parseDate(day),
                        currency: "",
                    };
                }
            }
        }

        const result: StringMap<AzureCostEntry[]> = {};
        for (const [poolId, map] of Object.entries(poolMap)) {
            result[poolId] = Object.values(map).sortBy(x => x.date);
        }
        return result;
    }

    private _parseDate(date: number) {
        return DateTime.fromFormat(date.toString(), "yyyyLLdd").toJSDate();
    }

    private _buildQuery(timeRange: TimeRange): AzureCostQuery {
        return {
            type: "Usage",
            timeframe: "Custom",
            timePeriod: {
                from: timeRange.start.toISOString(),
                to: timeRange.end.toISOString(),
            },
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
                ],
                filter: {
                    Dimensions: {
                        Name: "ResourceType",
                        Operator: "In",
                        Values: ["Microsoft.Batch/batchaccounts", "Microsoft.Batch/batchaccounts/batchpools"],
                    },
                    // Dimensions: {
                    //     Name: "ResourceId",
                    //     Operator: "In",
                    //     Values: [accountId],
                    // },
                },
            },
        };
    }
}
