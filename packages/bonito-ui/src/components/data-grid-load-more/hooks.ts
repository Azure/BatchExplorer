import React, { useRef, useEffect } from "react";

export interface ILoadMoreListResult<T> {
    done: boolean;
    list: T[];
}

export function useLoadMore<T>(loadFn: () => Promise<ILoadMoreListResult<T>>) {
    const [items, setItems] = React.useState<T[]>([]);
    const [hasMore, setHasMore] = React.useState(true);

    const isLoading = useRef(false);

    const loadMore = React.useCallback(async (): Promise<void> => {
        const { list, done } = await loadFn();
        if (!done && !list.length) {
            // no more data, try again
            return loadMore();
        }
        // Need to set isLoading to false before any set state call,
        // otherwise, the DataGrid will rerender and won't trigger
        // another load more even if the shimmer line is still in view
        // because isLoading is still true
        isLoading.current = false;
        if (done) {
            setHasMore(false);
        }
        setItems((oriItems) => [...oriItems, ...list]);
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
        isLoading.current = true;
        loadMore().catch(() => {
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
