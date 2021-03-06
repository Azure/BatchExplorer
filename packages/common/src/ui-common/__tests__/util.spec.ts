import { initMockEnvironment } from "../environment";
import { cloneDeep, uniqueId } from "../util";

describe("Common utilities", () => {
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
});
