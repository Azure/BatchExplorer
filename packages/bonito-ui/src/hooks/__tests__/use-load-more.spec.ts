import { useLoadMore } from "../use-load-more";
import { renderHook } from "@testing-library/react-hooks";
import { act } from "@testing-library/react";

describe("useLoadMore hooks", () => {
    test("Throttle onLoadMore", async () => {
        const onLoad = jest.fn(() =>
            Promise.resolve({ done: false, items: [1] })
        );
        const { result, waitForNextUpdate } = renderHook(() =>
            useLoadMore(onLoad)
        );
        expect(result.current.hasMore).toBe(true);
        expect(result.current.items).toEqual([]);
        // trigger onLoadMore 3 times, but onLoad should only be
        // called once, because it is throttled to wait for the previous
        // call to finish
        for (let i = 0; i < 3; i++) {
            result.current.onLoadMore();
        }
        expect(onLoad.mock.calls).toEqual([[true]]);

        // wait for the previous call to finish and state to be updated
        await waitForNextUpdate();

        expect(result.current.hasMore).toBe(true);
        expect(result.current.items).toEqual([1]);

        // trigger onLoadMore again, onLoad should be called again
        result.current.onLoadMore();
        await waitForNextUpdate();
        expect(onLoad.mock.calls).toEqual([[true], [false]]);
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
            ({ onLoad }) => useLoadMore(onLoad),
            {
                initialProps: { onLoad: loadFn1 },
            }
        );

        // change onLoad to a new one, the previous onLoad should be
        // cancelled, which means it should not set items to [1]
        const loadFn2 = getNewLoadFn([2]);
        rerender({ onLoad: loadFn2 });

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
        const onLoad = getLoadFn();
        const { result, waitForNextUpdate } = renderHook(() =>
            useLoadMore(onLoad)
        );

        await waitForNextUpdate();

        // onLoad should be called 3 times, previous 2 calls return no items
        // and done is false, should continue to call onLoad until done is
        // true
        expect(onLoad).toHaveBeenCalledTimes(expectedNumOfCalls);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.items).toEqual([1]);
    });

    test("onRefresh", async () => {
        const onLoad = jest.fn(() =>
            Promise.resolve({ done: true, items: [1] })
        );
        const { result, waitForNextUpdate } = renderHook(() =>
            useLoadMore(onLoad)
        );
        act(() => {
            result.current.onRefresh();
        });
        await waitForNextUpdate();

        expect(result.current.hasMore).toBe(false);
        expect(result.current.items).toEqual([1]);

        expect(onLoad.mock.calls).toEqual([[true], [true]]);
    });

    test("onLoadError", async () => {
        const rejectedPromise = Promise.reject("load error");
        const onLoad = jest.fn(() => rejectedPromise);
        const onLoadError = jest.fn();
        const { result } = renderHook(() => useLoadMore(onLoad, onLoadError));
        expect(result.current.hasMore).toBe(true);
        expect(result.current.items).toEqual([]);

        // wait for the onLoad's promise to reject
        await rejectedPromise.catch(() => null);

        expect(onLoad.mock.calls).toEqual([[true]]);
        expect(onLoadError.mock.calls).toEqual([["load error"]]);
    });
});
