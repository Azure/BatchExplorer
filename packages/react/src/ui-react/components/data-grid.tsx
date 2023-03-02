import * as React from "react";
import {
    DetailsList,
    IColumn,
    IDetailsListProps,
    SelectionMode,
} from "@fluentui/react/lib/DetailsList";
import { useAppTheme } from "../theme";
import { autoFormat } from "@batch/ui-common";
import { Observer } from "mobx-react-lite";
import { lodashGet } from "@batch/ui-common";

export interface DataGridProps
    extends Omit<IDetailsListProps, "columns" | "selectionMode"> {
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
     * Allow single multiple or no selections. If "none" is specified, selection
     * checkboxes will not appear.
     */
    selectionMode?: "single" | "multiple" | "none";
}

/**
 * Represents a single column of data in the grid
 */
export interface DataGridColumn
    extends Omit<IColumn, "key" | "name" | "fieldName" | "minWidth"> {
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
}

const defaultColumnMinWidth = 48;

/**
 * Displays a sortable, filterable grid. Wraps the Fluent UI DetailsList
 * component
 */
export const DataGrid: React.FC<DataGridProps> = (props) => {
    const theme = useAppTheme();

    const {
        columns,
        columnDefaultMaxWidth,
        items,
        selectionMode,
        ...restProps
    } = props;

    const detailsListColumns = React.useMemo(() => {
        const detailsListCols: IColumn[] = [];
        if (columns) {
            let i = 1;
            for (const c of columns) {
                if (typeof c === "string") {
                    // Simple column names
                    detailsListCols.push({
                        key: `column${i++}`,
                        name: c,
                        fieldName: c,
                        onRender: (item) => (
                            <Observer>
                                {() => <>{autoFormat(lodashGet(item, c))}</>}
                            </Observer>
                        ),

                        minWidth: defaultColumnMinWidth,
                        maxWidth: columnDefaultMaxWidth,
                        isResizable: true,
                    });
                } else if (c.prop) {
                    const {
                        label,
                        prop,
                        onRender,
                        minWidth,
                        maxWidth,
                        ...rest
                    } = c;
                    // Column props
                    detailsListCols.push({
                        key: `column${i++}`,
                        name: label ?? prop,
                        fieldName: prop,
                        onRender: (item, ...rest) => (
                            <Observer>
                                {() => (
                                    <>
                                        {onRender
                                            ? onRender(item, ...rest)
                                            : autoFormat(
                                                  prop
                                                      ? lodashGet(item, prop)
                                                      : null
                                              )}
                                    </>
                                )}
                            </Observer>
                        ),
                        minWidth: minWidth ?? defaultColumnMinWidth,
                        maxWidth: maxWidth ?? columnDefaultMaxWidth,
                        isResizable: true,
                        ...rest,
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
    }, [columns, columnDefaultMaxWidth]);

    return (
        <DetailsList
            theme={theme}
            selectionMode={
                selectionMode === "single"
                    ? SelectionMode.single
                    : selectionMode === "multiple"
                    ? SelectionMode.multiple
                    : selectionMode === "none"
                    ? SelectionMode.none
                    : undefined
            }
            columns={detailsListColumns}
            items={items ?? []}
            {...restProps}
        />
    );
};
