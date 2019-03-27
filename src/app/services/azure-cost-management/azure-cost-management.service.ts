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
}

export interface BatchAccountCost {
    // Sum of all the prices for the given period
    totalForPeriod: number;

    // Currency
    currency: string;

    // Costs per pool
    pools: StringMap<BatchPoolCost>;
}

export interface BatchPoolCost {
    // Sum of all the prices for the given period
    totalForPeriod: number;

    // Costs per pool
    costs: AzureCostEntry[];
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
                return {
                    totalForPeriod: 0,
                    currency: "n/a",
                    pools: {},
                };
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
    }>): BatchAccountCost {
        let currency: string | null = null;
        let total = 0;
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
            };
            total += row.preTaxCost;
            if (currency == null && row.currency) {
                currency = row.currency;
            }
        }
        for (const map of Object.values(poolMap)) {
            for (const day of days) {
                if (!(day in map)) {
                    map[day] = {
                        preTaxCost: 0,
                        date: this._parseDate(day),
                    };
                }
            }
        }

        const result: StringMap<BatchPoolCost> = {};
        for (const [poolId, map] of Object.entries(poolMap)) {
            const costs = Object.values(map);
            result[poolId] = {
                totalForPeriod: costs.reduce((t, c) => t + c.preTaxCost, 0),
                costs: costs.sortBy(x => x.date),
            };
        }
        return {
            totalForPeriod: total,
            currency: currency || "?",
            pools: result,
        };
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
