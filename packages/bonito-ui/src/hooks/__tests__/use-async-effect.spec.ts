import { renderHook } from "@testing-library/react";
import { useAsyncEffect } from "../use-async-effect";
import { act } from "react";

describe("useAsyncEffect hook", () => {
    test("Can pass in an async effect callback", () => {
        let value = "foo";
        let counter = 1;
        let callCount = 0;

        const { result, rerender } = renderHook(() => {
            return useAsyncEffect(async () => {
                callCount++;
                if (counter > 1) {
                    value = "bar";
                }
            }, [counter]);
        });

        // Effect should have run once. Return value is ignored.
        expect(result).toBeDefined();
        expect(result.current).toBeUndefined();
        expect(callCount).toBe(1);
        expect(value).toBe("foo");

        // Rerender has no effect
        rerender();
        expect(callCount).toBe(1);
        expect(value).toBe("foo");

        // Updating the counter forces the effect to run again
        act(() => {
            counter++;
        });
        rerender();
        expect(callCount).toBe(2);
        expect(value).toBe("bar");
    });

    test("calls cleanup function", async () => {
        let cleanupCalled = false;
        let count = 0;
        const { result, unmount } = renderHook(() =>
            useAsyncEffect(async () => {
                count++;
                return () => (cleanupCalled = true);
            })
        );

        expect(result).toBeDefined();
        expect(result.current).toBeUndefined();
        expect(count).toBe(1);
        expect(cleanupCalled).toBe(false);

        await unmount();
        expect(cleanupCalled).toBe(true);
    });
});
