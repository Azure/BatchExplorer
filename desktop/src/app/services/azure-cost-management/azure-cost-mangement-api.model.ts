
export interface AzureCostAggregation {

}

export interface AzureCostQuerySortConfiguration {
    direction: "ascending" | "descending";
    name: string;
}

export interface AzureCostQueryGrouping {
    type: "Dimension" | "Tag";
    name: CostManagementDimensions;
}

export interface QueryFilter {
    And?: QueryFilter[];
    Or?: QueryFilter[];
    Not?: QueryFilter;
    Dimensions?: {
        Name: string,
        Operator: "In" | "Eq",
        Values: string[],
    };
}

export interface AzureCostQuery {
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

export interface QueryResult {
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
