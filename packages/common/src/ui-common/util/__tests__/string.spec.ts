import { capitalizeFirst, equalsIgnoreCase } from "../../util";

describe("String utility functions", () => {
    test("capitalizeFirst() function", () => {
        expect(capitalizeFirst("foo bar")).toBe("Foo bar");
        expect(capitalizeFirst("a")).toBe("A");
        expect(capitalizeFirst("A")).toBe("A");
        expect(capitalizeFirst("")).toBe("");
        expect(capitalizeFirst("1")).toBe("1");
    });

    test("equalsIgnoreCase() function", () => {
        expect(equalsIgnoreCase("Abc", "abC")).toBe(true);
        expect(equalsIgnoreCase("abc", " abc")).toBe(false);
        expect(equalsIgnoreCase("", "")).toBe(true);
        expect(equalsIgnoreCase(undefined, undefined)).toBe(true);
        expect(equalsIgnoreCase(undefined, "")).toBe(true);
        expect(equalsIgnoreCase(undefined, " ")).toBe(false);
        expect(equalsIgnoreCase(null as unknown as undefined, undefined)).toBe(
            true
        );
        expect(
            equalsIgnoreCase(
                null as unknown as undefined,
                null as unknown as undefined
            )
        ).toBe(true);
    });
});
