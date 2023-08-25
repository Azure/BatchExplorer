import * as React from "react";
import {
    IColumn,
    IDetailsFooterProps,
    // DetailsList,
    IDetailsRowProps,
} from "@fluentui/react/lib/DetailsList";
import { ShimmeredDetailsList } from "@fluentui/react/lib/ShimmeredDetailsList";
import { useCallback, useMemo } from "react";
import {} from "@fluentui/react-hooks";
// import { Stack } from "@fluentui/react";

const NUM_OF_LOAD_MORE_SHIMMER = 3;

export interface DataGridLoadMoreProps {
    items: unknown[];
    colums: IColumn[];
    hasMore?: boolean;
    onLoadMore?: () => void;
    noReusltText?: string;
}

/**
 * Displays a sortable, filterable grid. Wraps the Fluent UI DetailsList
 * component
 */
export const DataGridLoadMore: React.FC<DataGridLoadMoreProps> = (props) => {
    const {
        items: propsItems,
        colums,
        hasMore,
        noReusltText,
        onLoadMore,
    } = props;

    const noResult = useMemo(() => {
        return !propsItems.length && !hasMore;
    }, [hasMore, propsItems.length]);

    const items = useMemo(() => {
        if (noResult) {
            return [];
        }
        // display 10 lines of shimmering items when inital loading
        if (!propsItems.length) {
            return Array(10).fill(null);
        }
        // display 3 more shimmering items when loading more
        return [
            ...propsItems,
            ...Array(hasMore ? NUM_OF_LOAD_MORE_SHIMMER : 0).fill(null),
        ];
    }, [propsItems, noResult, hasMore]);

    const onRenderDetailsFooter = useCallback(
        (props?: IDetailsFooterProps, defaultRender?) => {
            const onResultComp = noResult ? (
                <div style={{ textAlign: "center" }}>
                    {noReusltText || "No result"}
                </div>
            ) : null;
            return (
                <div>
                    {onResultComp}
                    {defaultRender?.(props)}
                </div>
            );
        },
        [noResult, noReusltText]
    );

    const triggerLoadMore = useCallback(() => {
        const shouldLoadMore = onLoadMore && propsItems.length && hasMore;
        // !isLoadingMore.current;
        // console.log("triggerLoadMore", {
        //     shouldLoadMore,
        // });
        if (shouldLoadMore) {
            onLoadMore();
        }
    }, [hasMore, onLoadMore, propsItems.length]);

    const onRenderCustomPlaceholder = useCallback(
        (
            rowProps: IDetailsRowProps,
            index?: number,
            defaultRender?: (props: IDetailsRowProps) => React.ReactNode
        ) => {
            // determine whether to fire onLoadMore callback
            // onRenderCustomPlaceholder might be called for multiple times
            // before user scrolls to the bottom
            // see: https://github.com/microsoft/fluentui/issues/4050

            if (index === items.length - 1) {
                triggerLoadMore();
            }

            return defaultRender?.(rowProps);
        },
        [items.length, triggerLoadMore]
    );

    return (
        <ShimmeredDetailsList
            columns={colums}
            items={items}
            setKey="name"
            onRenderDetailsFooter={onRenderDetailsFooter}
            onRenderCustomPlaceholder={onRenderCustomPlaceholder}
        />
    );
};
