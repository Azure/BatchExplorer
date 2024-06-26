import * as React from "react";
import {
    IColumn,
    IDetailsFooterProps,
    IDetailsRowProps,
    SelectionMode,
} from "@fluentui/react/lib/DetailsList";
import { autoFormat, translate } from "@azure/bonito-core";
import { ShimmeredDetailsList } from "@fluentui/react/lib/ShimmeredDetailsList";

export const NUM_OF_SHIMMER_FULL = 10;
export const NUM_OF_SHIMMER_MORE = 3;

export interface DataGridProps<T = unknown> {
    /**
     * A list of columns to display in the grid
     */
    columns?: string[] | DataGridColumn<T>[];

    /**
     * Global default maximum width for all grid columns. When maxWidth is
     * specified per column, that value will override this one.
     */
    columnDefaultMaxWidth?: number;

    /**
     * A list of objects to display in the grid
     */
    items?: T[];

    /**
     * Callback when a row in the grid becomes active by clicking or navigating
     * via the keyboard
     */
    onActiveItemChanged?: (
        item?: T,
        index?: number,
        ev?: React.FocusEvent<HTMLElement>
    ) => void;

    /**
     * Allow single multiple or no selections. If "none" is specified, selection
     * checkboxes will not appear.
     */
    selectionMode?: "single" | "multiple" | "none";

    /**
     * Whether there are more items to load.
     * If true, the grid will display 10 lines of shimmering when items is empty,
     * indicating that the datagrid is initial loading, or 3 lines of shimmering
     * when items is not empty, indicating that the datagrid is loading more data.
     * If false/undefined, the grid will display "No result" when items is empty.
     */
    hasMore?: boolean;

    /**
     * Callback when the user scrolls to the bottom while hasMore is true.
     * Note this callback might be called multiple times while the user scrolls,
     * so it is up to the caller to implement throttling.
     */
    onLoadMore?: () => void;

    /**
     * Text to display when there is no result.
     * Default to "No result".
     * Only used when hasMore is undefined or false.
     */
    noResultText?: string;

    /**
     * Whether to render in compact mode.
     * @defaultvalue false
     */
    compact?: boolean;
}

/**
 * Represents a single column of data in the grid
 */
export interface DataGridColumn<T = unknown> {
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

    /**
     * Custom renderer for cell content, instead of the default text rendering.
     */
    onRender?: (
        item: T,
        index?: number,
        column?: IColumn
    ) => JSX.Element | null | string;
}

const defaultColumnMinWidth = 48;

/**
 * Displays a sortable, filterable grid. Wraps the Fluent UI DetailsList
 * component
 */
export const DataGrid = <T = unknown,>(props: DataGridProps<T>) => {
    const {
        columns: propColumns,
        columnDefaultMaxWidth,
        selectionMode,
        onActiveItemChanged,
        compact,
    } = props;

    const columns = useColumns(propColumns, columnDefaultMaxWidth);

    const { items, onRenderDetailsFooter, onRenderCustomPlaceholder } =
        useLoadMoreItems(props);

    return (
        <ShimmeredDetailsList
            compact={compact}
            onActiveItemChanged={onActiveItemChanged}
            selectionMode={
                selectionMode === "single"
                    ? SelectionMode.single
                    : selectionMode === "multiple"
                      ? SelectionMode.multiple
                      : selectionMode === "none"
                        ? SelectionMode.none
                        : undefined
            }
            columns={columns}
            items={items}
            onRenderDetailsFooter={onRenderDetailsFooter}
            onRenderCustomPlaceholder={onRenderCustomPlaceholder}
        />
    );
};

function useColumns<T>(
    columns: DataGridProps<T>["columns"],
    columnDefaultMaxWidth: DataGridProps["columnDefaultMaxWidth"]
): IColumn[] {
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
                        onRender: (item) => autoFormat(item[c]),
                        minWidth: defaultColumnMinWidth,
                        maxWidth: columnDefaultMaxWidth,
                        isResizable: true,
                    });
                } else if (c.prop) {
                    // Column props
                    detailsListCols.push({
                        key: `column${i++}`,
                        name: c.label ?? c.prop,
                        fieldName: c.prop,
                        onRender:
                            c.onRender ??
                            ((item) =>
                                autoFormat(c.prop ? item[c.prop] : null)),
                        minWidth: c.minWidth ?? defaultColumnMinWidth,
                        maxWidth: c.maxWidth ?? columnDefaultMaxWidth,
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
    }, [columns, columnDefaultMaxWidth]);

    return detailsListColumns;
}

function useLoadMoreItems<T>(props: DataGridProps<T>) {
    const { items: propsItems = [], hasMore, onLoadMore, noResultText } = props;

    const noResult = React.useMemo(() => {
        return !propsItems.length && !hasMore;
    }, [hasMore, propsItems.length]);

    const items = React.useMemo(() => {
        if (noResult) {
            return [];
        }
        // display 10 lines of shimmering when inital loading
        if (!propsItems.length) {
            return Array(NUM_OF_SHIMMER_FULL).fill(null);
        }
        // display 3 more shimmering when loading more
        return [
            ...propsItems,
            ...Array(hasMore ? NUM_OF_SHIMMER_MORE : 0).fill(null),
        ];
    }, [propsItems, noResult, hasMore]);

    const onRenderDetailsFooter = React.useCallback(
        (props?: IDetailsFooterProps, defaultRender?) => {
            const onResultComp = noResult ? (
                <div style={{ textAlign: "center" }}>
                    {noResultText || translate("bonito.ui.dataGrid.noResults")}
                </div>
            ) : null;
            return (
                <div>
                    {onResultComp}
                    {defaultRender?.(props)}
                </div>
            );
        },
        [noResult, noResultText]
    );

    const triggerLoadMore = React.useCallback(() => {
        if (onLoadMore && propsItems.length && hasMore) {
            onLoadMore();
        }
    }, [hasMore, onLoadMore, propsItems.length]);

    const onRenderCustomPlaceholder = React.useCallback(
        (
            rowProps: IDetailsRowProps,
            index?: number,
            defaultRender?: (props: IDetailsRowProps) => React.ReactNode
        ) => {
            // check if it's the first shimmering row
            if (index === items.length - NUM_OF_SHIMMER_MORE) {
                triggerLoadMore();
            }
            return defaultRender?.(rowProps);
        },
        [items.length, triggerLoadMore]
    );

    return {
        items,
        onRenderDetailsFooter,
        onRenderCustomPlaceholder,
    };
}
