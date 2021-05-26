import * as React from "react";
import {
    DetailsList,
    IColumn,
    SelectionMode,
} from "@fluentui/react/lib/DetailsList";
import { useAppTheme } from "../theme";

export interface DataGridProps {
    columns?: string[] | DataGridColumn[];
    columnDefaultMaxWidth?: number;
    items?: unknown[];
    onActiveItemChanged?: (
        item?: unknown,
        index?: number,
        ev?: React.FocusEvent<HTMLElement>
    ) => void;
    selectionMode?: "single" | "multiple" | "none";
}

export interface DataGridColumn {
    label?: string;
    prop?: string;
    minWidth?: number;
    maxWidth?: number;
}

const defaultColumnMinWidth = 48;

/**
 * Displays a sortable, filterable grid. Wraps the Fluent UI DetailsList
 * component
 */
export const DataGrid: React.FC<DataGridProps> = (props) => {
    const theme = useAppTheme();

    const columns: IColumn[] = [];
    if (props.columns) {
        let i = 1;
        for (const c of props?.columns) {
            if (typeof c === "string") {
                // Simple column names
                columns.push({
                    key: `column${i++}`,
                    name: c,
                    fieldName: c,
                    minWidth: defaultColumnMinWidth,
                    maxWidth: props.columnDefaultMaxWidth,
                    isResizable: true,
                });
            } else if (c.prop) {
                // Column props
                columns.push({
                    key: `column${i++}`,
                    name: c.label ?? c.prop,
                    fieldName: c.prop,
                    minWidth: defaultColumnMinWidth,
                    maxWidth: c.maxWidth ?? props.columnDefaultMaxWidth,
                    isResizable: true,
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
            theme={theme}
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
