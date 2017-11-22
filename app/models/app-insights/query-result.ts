export interface AppInsightsQueryResult {
    tables: AppInsightsTable[];
}

export interface AppInsightsTable {
    name: string;
    columns: AppInsightsTableColumn[];
    rows: AppInsightsTableRow[];
}

export interface AppInsightsTableColumn {
    name: string;
    type: AppInsightsTableColumnType;
}

export enum AppInsightsTableColumnType {
    string = "string",
    datetime = "datetime",
    number = "real",
}

type AppInsightsTableRow = any[];
