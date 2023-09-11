import { useLoadMore } from "../use-load-more";
import { renderHook } from "@testing-library/react-hooks";
import { act } from "@testing-library/react";

describe("useLoadMore hooks", () => {
    test("Throttle onLoadMore", async () => {
        const loadFn = jest.fn(() =>
            Promise.resolve({ done: false, items: [1] })
        );
        const { result, waitForNextUpdate } = renderHook(() =>
            useLoadMore(loadFn)
        );
        expect(result.current.hasMore).toBe(true);
        expect(result.current.items).toEqual([]);
        // trigger onLoadMore 3 times, but loadFn should only be
        // called once, because it is throttled to wait for the previous
        // call to finish
        for (let i = 0; i < 3; i++) {
            result.current.onLoadMore();
        }
        expect(loadFn.mock.calls).toEqual([[true]]);

        // wait for the previous call to finish and state to be updated
        await waitForNextUpdate();

        expect(result.current.hasMore).toBe(true);
        expect(result.current.items).toEqual([1]);

        // trigger onLoadMore again, loadFn should be called again
        result.current.onLoadMore();
        await waitForNextUpdate();
        expect(loadFn.mock.calls).toEqual([[true], [false]]);
    });

    test("Cancel pending load", async () => {
        const getNewLoadFn = (items: number[]) => {
            return jest.fn(() => {
                return Promise.resolve({
                    done: true,
                    items: items,
                });
            });
        };
        const loadFn1 = getNewLoadFn([1]);
        const { result, rerender, waitForNextUpdate } = renderHook(
            ({ loadFn }) => useLoadMore(loadFn),
            {
                initialProps: { loadFn: loadFn1 },
            }
        );

        // change loadFn to a new one, the previous loadFn should be
        // cancelled, which means it should not set items to [1]
        const loadFn2 = getNewLoadFn([2]);
        rerender({ loadFn: loadFn2 });

        await waitForNextUpdate();

        expect(result.current.hasMore).toBe(false);
        expect(result.current.items).toEqual([2]);

        expect(loadFn1).toHaveBeenCalledTimes(1);
        expect(loadFn2).toHaveBeenCalledTimes(1);
    });

    test("No items", async () => {
        const expectedNumOfCalls = 3;
        const getLoadFn = () => {
            let i = 0;
            return jest.fn(() => {
                i += 1;
                const shouldFinish = i >= expectedNumOfCalls;
                return Promise.resolve({
                    done: shouldFinish,
                    items: shouldFinish ? [1] : [],
                });
            });
        };
        const loadFn = getLoadFn();
        const { result, waitForNextUpdate } = renderHook(() =>
            useLoadMore(loadFn)
        );

        await waitForNextUpdate();

        // loadFn should be called 3 times, previous 2 calls return no items
        // and done is false, should continue to call loadFn until done is
        // true
        expect(loadFn).toHaveBeenCalledTimes(expectedNumOfCalls);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.items).toEqual([1]);
    });

    test("onRefresh", async () => {
        const loadFn = jest.fn(() =>
            Promise.resolve({ done: true, items: [1] })
        );
        const { result, waitForNextUpdate } = renderHook(() =>
            useLoadMore(loadFn)
        );
        act(() => {
            result.current.onRefresh();
        });
        await waitForNextUpdate();

        expect(result.current.hasMore).toBe(false);
        expect(result.current.items).toEqual([1]);

        expect(loadFn.mock.calls).toEqual([[true], [true]]);
    });
});
