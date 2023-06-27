import * as React from "react";
import {
    DetailsList,
    IColumn,
    SelectionMode,
} from "@fluentui/react/lib/DetailsList";
import { useAppTheme } from "../theme";
import { autoFormat } from "@batch/ui-common";

export interface DataGridProps {
    /**
     * A list of columns to display in the grid
     */
    columns?: string[] | DataGridColumn[];

    /**
     * Global default maximum width for all grid columns. When maxWidth is
     * specified per column, that value will override this one.
     */
    columnDefaultMaxWidth?: number;

    /**
     * A list of objects to display in the grid
     */
    items?: unknown[];

    /**
     * Callback when a row in the grid becomes active by clicking or navigating
     * via the keyboard
     */
    onActiveItemChanged?: (
        item?: unknown,
        index?: number,
        ev?: React.FocusEvent<HTMLElement>
    ) => void;

    /**
     * Allow single multiple or no selections. If "none" is specified, selection
     * checkboxes will not appear.
     */
    selectionMode?: "single" | "multiple" | "none";
}

/**
 * Represents a single column of data in the grid
 */
export interface DataGridColumn {
    /**
     * User-friendly column label (if not defined, the property name will be
     * used)
     */
    label?: string;

    /**
     * The name of the property to look up when determining the column's value
     */
    prop?: string;

    /**
     * Minimum width (in pixels) of the column
     */
    minWidth?: number;

    /**
     * Maximum width (in pixels) of the column
     */
    maxWidth?: number;
}

const defaultColumnMinWidth = 48;

/**
 * Displays a sortable, filterable grid. Wraps the Fluent UI DetailsList
 * component
 */
export const DataGrid: React.FC<DataGridProps> = (props) => {
    const theme = useAppTheme();

    const detailsListColumns = React.useMemo(() => {
        const detailsListCols: IColumn[] = [];
        if (props.columns) {
            let i = 1;
            for (const c of props.columns) {
                if (typeof c === "string") {
                    // Simple column names
                    detailsListCols.push({
                        key: `column${i++}`,
                        name: c,
                        fieldName: c,
                        onRender: (item) => autoFormat(item[c]),
                        minWidth: defaultColumnMinWidth,
                        maxWidth: props.columnDefaultMaxWidth,
                        isResizable: true,
                    });
                } else if (c.prop) {
                    // Column props
                    detailsListCols.push({
                        key: `column${i++}`,
                        name: c.label ?? c.prop,
                        fieldName: c.prop,
                        onRender: (item) =>
                            autoFormat(c.prop ? item[c.prop] : null),
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
        return detailsListCols;
    }, [props.columns, props.columnDefaultMaxWidth]);

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
            columns={detailsListColumns}
            items={props.items ?? []}
        />
    );
};
