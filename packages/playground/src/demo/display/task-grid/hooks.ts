import { useEffect, useRef } from "react";

import { ILoadMoreListResult } from "./utils";
import React from "react";

export function useLoadMore<T>(loadFn: () => Promise<ILoadMoreListResult<T>>) {
    const [items, setItems] = React.useState<T[]>([]);
    const [hasMore, setHasMore] = React.useState(true);

    const isLoading = useRef(false);

    const loadMore = React.useCallback(async (): Promise<void> => {
        const { data, done } = await loadFn();
        if (!done && !data.length) {
            // no more data, try again
            return loadMore();
        }
        isLoading.current = false;
        if (done) {
            setHasMore(false);
        }
        setItems((oriItems) => [...oriItems, ...data]);
    }, [loadFn]);

    /**
     * Guarded load more function to prevent multiple load more calls
     * triggered by the DataGrid rerender last shimmer event.
     */
    const guardedLoadMore = React.useCallback(async () => {
        console.log("guardedLoadMore isLoading: ", isLoading.current);
        if (isLoading.current) {
            return;
        }
        // console.log("setting isLoading.current to true");
        isLoading.current = true;
        loadMore().catch(() => {
            // console.log("setting isLoading.current to false");
            isLoading.current = false;
        });
    }, [loadMore]);

    useEffect(() => {
        setItems([]);
        setHasMore(true);
        guardedLoadMore();
    }, [guardedLoadMore]);

    return {
        items,
        hasMore,
        loadMoreCallback: guardedLoadMore,
    };
}
