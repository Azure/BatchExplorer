import { initMockEnvironment } from "../../environment";
import {
    cloneDeep,
    debounce,
    delay,
    isPromiseLike,
    mergeDeep,
    uniqueId,
} from "../functions";

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

    test("mergeDeep() function", () => {
        expect(
            mergeDeep(
                {
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
                },
                {
                    // Overwrite existing prop
                    str: "foo",
                    obj: {
                        // Nested object property merging
                        innerObj: {
                            notEmptyList: ["notnull"],
                        },
                        // Lists should be overwritten, not merged
                        innerList: ["c"],
                    },
                    list: "notreallyalist",
                }
            )
        ).toStrictEqual({
            str: "foo",
            num: 123,
            obj: {
                innerStr: "baz",
                innerNum: 321,
                innerObj: {
                    emptyList: [],
                    notEmptyList: ["notnull"],
                },
                innerList: ["c"],
            },
            list: "notreallyalist",
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
