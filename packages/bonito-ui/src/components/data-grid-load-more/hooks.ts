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

export function useLoadMore<T>(loadFn: () => Promise<ILoadMoreListResult<T>>) {
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
