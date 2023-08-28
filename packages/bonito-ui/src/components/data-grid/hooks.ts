import { CancelledPromiseError } from "@azure/bonito-core";
import {
    ICancellablePromise,
    cancellablePromise,
} from "@azure/bonito-core/lib/util";
import React, { useRef, useEffect } from "react";

export interface ILoadMoreListResult<T> {
    done: boolean;
    list: T[];
}

/**
 * Hooks for load more items, should be used with the DataGrid component
 * Handles the load more callback throttling and cancellation, will auto
 * retry if the loadFn returns no items and there are more items to load.
 * @param loadFn function to load more items, change of reference will trigger
 * a new load and set the items to empty and hasMore to true.
 * @returns items, hasMore and loadMoreCallback
 */
export function useLoadMoreItems<T>(
    loadFn: () => Promise<ILoadMoreListResult<T>>
) {
    const [items, setItems] = React.useState<T[]>([]);
    const [hasMore, setHasMore] = React.useState(true);

    const pendingPromise = useRef<ICancellablePromise<
        ILoadMoreListResult<T>
    > | null>(null);

    const loadMore = React.useCallback(async (): Promise<void> => {
        if (pendingPromise.current) {
            return;
        }
        pendingPromise.current = cancellablePromise(loadFn());
        try {
            const { list, done } = await pendingPromise.current;
            pendingPromise.current = null;
            if (!done && !list.length) {
                // no more data, try again
                return loadMore();
            }
            if (done) {
                setHasMore(false);
            }
            setItems((oriItems) => [...oriItems, ...list]);
        } catch (error) {
            if (!(error instanceof CancelledPromiseError)) {
                pendingPromise.current = null;
            }
        }
    }, [loadFn]);

    useEffect(() => {
        setItems([]);
        setHasMore(true);
        loadMore();
        return () => {
            if (pendingPromise.current) {
                pendingPromise.current.cancel();
                pendingPromise.current = null;
            }
        };
    }, [loadMore]);

    return {
        items,
        hasMore,
        loadMoreCallback: loadMore,
    };
}
