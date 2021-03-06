import * as React from "react";
import { DetailsList, IColumn } from "@fluentui/react/lib/DetailsList";

export interface DataGridProps {
    columns?: string[] | DataGridColumn[];
    items?: unknown[];
}

export interface DataGridColumn {
    fieldName?: string;
}

export const DataGrid: React.FC<DataGridProps> = (props) => {
    const columns: IColumn[] = [];
    if (props.columns) {
        let i = 1;
        for (const c of props?.columns) {
            if (typeof c === "string") {
                columns.push({
                    key: `column${i++}`,
                    name: c,
                    fieldName: c,
                    minWidth: 100,
                    isResizable: true,
                    isSorted: true,
                });
            } else {
                throw new Error("Not yet implemented");
            }
        }
    }

    return <DetailsList columns={columns} items={props.items ?? []} />;
};
