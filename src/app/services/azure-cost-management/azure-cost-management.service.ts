import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, ArmSubscription } from "app/models";
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
    name: string;
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

function costManagementUrl(subscriptionId: string) {
    return `subscriptions/${subscriptionId}/providers/Microsoft.CostManagement`;
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
        const url = `${costManagementUrl(subscription.subscriptionId)}/query`;
        const payload = this._buildQuery(accountId);

        return this.azure.post<QueryResult>(subscription, url, payload).pipe(
            map(x => this._processQueryResponse(x)),
            share(),
        );
    }

    private _processQueryResponse(response: QueryResult): AzureCostEntry[] {
        console.log("Response", response);
        const columnIndexes = {
            cost: null,
            date: null,
            meter: null,
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
                case "Meter":
                    columnIndexes.meter = index;
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

        return response.properties.rows.map((row) => {
            return {
                preTaxCost: row[columnIndexes.cost],
                date: row[columnIndexes.date],
                meter: row[columnIndexes.meter],
                currency: row[columnIndexes.currency],
            };
        });
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
                        name: "Meter",
                    },
                    {
                        type: "Dimension",
                        name: "ServiceTier",
                    },
                    {
                        type: "Dimension",
                        name: "ServiceName",
                    },
                    {
                        type: "Dimension",
                        name: "MeterSubCategory",
                    },
                    {
                        type: "Dimension",
                        name: "MeterCategory",
                    },
                ],
                filter: {
                    Dimensions: {
                        Name: "ResourceId",
                        Operator: "In",
                        Values: [accountId],
                    },
                },
            },
        };
    }
}
