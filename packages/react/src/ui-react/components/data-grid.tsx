import * as React from "react";
import {
    DetailsList,
    IColumn,
    SelectionMode,
} from "@fluentui/react/lib/DetailsList";

export interface DataGridProps {
    columns?: string[] | DataGridColumn[];
    items?: unknown[];
    onActiveItemChanged?: (
        item?: any,
        index?: number,
        ev?: React.FocusEvent<HTMLElement>
    ) => void;
    selectionMode: "single" | "multiple" | "none";
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
            } else if (c.fieldName) {
                columns.push({
                    key: `column${i++}`,
                    name: c.fieldName,
                    fieldName: c.fieldName,
                    minWidth: 100,
                    isResizable: true,
                    isSorted: true,
                });
            } else {
                throw new Error(
                    "Invalid DataGrid column configuration: " +
                        JSON.stringify(c)
                );
            }
        }
    }

    return (
        <DetailsList
            onActiveItemChanged={props.onActiveItemChanged}
            selectionMode={
                props.selectionMode === "single"
                    ? SelectionMode.single
                    : props.selectionMode === "multiple"
                    ? SelectionMode.multiple
                    : props.selectionMode === "none"
                    ? SelectionMode.none
                    : undefined
            }
            columns={columns}
            items={props.items ?? []}
        />
    );
};
