import { CancelledPromiseError } from "@azure/bonito-core";
import {
    ICancellablePromise,
    cancellablePromise,
} from "@azure/bonito-core/lib/util";
import React, { useRef, useEffect } from "react";

export interface ILoadMoreListResult<T> {
    done: boolean;
    items: T[];
}

/**
 * Hooks for loading more items, should be used with the DataGrid component.
 * It handles the following:
 * 1. Throttle the load more callback to avoid multiple calls.
 * 2. Cancel the current loading if the loadFn changes.
 * 3. Retry if the loadFn returns no items and there are more items to load.
 * @param loadFn function to load more items, change of reference will trigger
 * a new load and set the items to empty and hasMore to true.
 * @returns items, hasMore and onLoadMore
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
            const { items, done } = await pendingPromise.current;
            pendingPromise.current = null;
            if (!done && !items.length) {
                // no more data, try again
                return loadMore();
            }
            if (done) {
                setHasMore(false);
            }
            setItems((oriItems) => [...oriItems, ...items]);
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
        onLoadMore: loadMore,
    };
}
