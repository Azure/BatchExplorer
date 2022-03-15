import { debounce } from "lodash";
import { initMockEnvironment } from "../../environment";
import { cloneDeep, delay, isArray, isPromiseLike, uniqueId } from "../../util";

describe("Common utility functions", () => {
    beforeEach(() => initMockEnvironment());

    test("uniqueId() function", () => {
        expect(uniqueId()).toBe("id-0");
        expect(uniqueId()).toBe("id-1");
        expect(uniqueId("foo")).toBe("foo-2");
        expect(uniqueId("bar")).toBe("bar-3");

        // Re-initializing the mock env resets the counter
        initMockEnvironment();
        expect(uniqueId()).toBe("id-0");
    });

    test("cloneDeep() function", () => {
        expect(
            cloneDeep({
                str: "bar",
                num: 123,
                obj: {
                    innerStr: "baz",
                    innerNum: 321,
                    innerObj: {
                        emptyList: [],
                    },
                    innerList: ["a", 1, 2, "b"],
                },
                list: [1, 2, "a", "b"],
            })
        ).toStrictEqual({
            str: "bar",
            num: 123,
            obj: {
                innerStr: "baz",
                innerNum: 321,
                innerObj: {
                    emptyList: [],
                },
                innerList: ["a", 1, 2, "b"],
            },
            list: [1, 2, "a", "b"],
        });
    });

    test("isPromiseLike() function", () => {
        // Promise-like
        expect(isPromiseLike(Promise.resolve())).toBe(true);
        expect(
            isPromiseLike({
                then: () => "foo",
            })
        ).toBe(true);

        // Not promise-like
        expect(isPromiseLike("nope")).toBe(false);
        expect(isPromiseLike({})).toBe(false);
        expect(
            isPromiseLike({
                then: "still nope",
            })
        ).toBe(false);
    });

    test("isArray() function", () => {
        // Arrays
        expect(isArray([])).toBe(true);
        expect(isArray(["yup"])).toBe(true);

        // Not arrays
        expect(isArray("nope")).toBe(false);
        expect(isArray(new Set([]))).toBe(false);
        expect(isArray({})).toBe(false);
    });

    test("debounce() function", async () => {
        let count = 0;
        const incrementCount = () => {
            count++;
        };

        const debouncedIncrement = debounce(incrementCount, 0);

        // Hasn't been called yet
        expect(count).toBe(0);

        debouncedIncrement();
        debouncedIncrement();
        debouncedIncrement();

        // Still hasn't run, but is pending
        expect(count).toBe(0);

        await delay(20);

        expect(count).toBe(1);
    });

    test("delay() function", async () => {
        let value = "foo";
        const promise = delay(0);
        promise.then(() => {
            value = "bar";
        });
        expect(value).toBe("foo");
        await promise;
        expect(value).toBe("bar");
    });
});
