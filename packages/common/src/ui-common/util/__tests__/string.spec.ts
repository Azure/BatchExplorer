import { capitalizeFirst } from "../../util";

describe("String utility functions", () => {
    test("capitalizeFirst() function", () => {
        expect(capitalizeFirst("foo bar")).toBe("Foo bar");
        expect(capitalizeFirst("a")).toBe("A");
        expect(capitalizeFirst("A")).toBe("A");
        expect(capitalizeFirst("")).toBe("");
        expect(capitalizeFirst("1")).toBe("1");
    });
});
