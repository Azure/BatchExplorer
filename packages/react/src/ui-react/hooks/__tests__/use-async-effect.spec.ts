import { renderHook, act } from "@testing-library/react-hooks";
import { useAsyncEffect } from "../use-async-effect";

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
                return "this should be ignored";
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
});
