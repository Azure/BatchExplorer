import { CancelledPromiseError } from "@azure/bonito-core";
import {
    ICancellablePromise,
    cancellablePromise,
} from "@azure/bonito-core/lib/util";
import React, { useRef, useEffect, useCallback } from "react";

export interface ILoadMoreListResult<T> {
    done: boolean;
    items: T[];
}
export interface ILoadMoreFn<T> {
    (fresh: boolean): Promise<ILoadMoreListResult<T>>;
}

/**
 * Hooks for loading more items
 * It handles the following:
 * 1. Throttle the onLoad callback when it's loading to avoid multiple calls.
 * 2. Cancel the current loading if the onLoad changes or onRefresh is called.
 * 3. Retry if the onLoad returns no items and there are more items to load.
 * @param onLoad function to load more items, change of function identity will
 * trigger a new load and set the items to empty and hasMore to true.
 * @param onLoadError callback when onLoad throws an error
 * @returns items, hasMore, onLoadMore and onRefresh
 */
export function useLoadMore<T>(
    onLoad: ILoadMoreFn<T>,
    onLoadError?: (error: any) => void
) {
    const [items, setItems] = React.useState<T[]>([]);
    const [hasMore, setHasMore] = React.useState(true);
    const onLoadErrorRef = useRef(onLoadError);
    onLoadErrorRef.current = onLoadError;

    const pendingPromise = useRef<ICancellablePromise<
        ILoadMoreListResult<T>
    > | null>(null);

    const loadMore = useCallback(
        async (fresh: boolean = false): Promise<void> => {
            if (pendingPromise.current) {
                return;
            }
            pendingPromise.current = cancellablePromise(onLoad(fresh));
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
                    onLoadErrorRef.current?.(error);
                }
            }
        },
        [onLoad]
    );

    const loadFresh = useCallback(() => {
        if (pendingPromise.current) {
            pendingPromise.current.cancel();
            pendingPromise.current = null;
        }
        setItems([]);
        setHasMore(true);
        loadMore(true);
    }, [loadMore]);

    useEffect(() => {
        loadFresh();
    }, [loadFresh]);

    return {
        items,
        hasMore,
        onLoadMore: loadMore,
        onRefresh: loadFresh,
    };
}
