
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

enum CostManagementDimensions {
    ResourceId = "ResourceId",
    MeterSubCategory = "MeterSubCategory",
    MeterCategory = "MeterCategory",
    Meter = "Meter",
    ServiceName = "ServiceName",
    ServiceTier = "ServiceTier",
}
