import { ObjectUtils } from "app/utils/object";

describe("Object extensions", () => {
    it("Should slice an object correctly", () => {
        const original = { a: 1, b: 2, c: 3, d: 4 };
        expect(ObjectUtils.slice(original, ["a", "b"])).toEqual({ a: 1, b: 2 });
        expect(ObjectUtils.slice(original, ["a", "c"])).toEqual({ a: 1, c: 3 });
        expect(ObjectUtils.slice(original, ["d", "c"])).toEqual({ d: 4, c: 3 });
    });

    it("Should execpt an object correctly", () => {
        const original = { a: 1, b: 2, c: 3, d: 4 };
        expect(ObjectUtils.except(original, ["a", "b"])).toEqual({ c: 3, d: 4 });
        expect(ObjectUtils.except(original, ["a", "c"])).toEqual({ b: 2, d: 4 });
        expect(ObjectUtils.except(original, ["d", "c"])).toEqual({ a: 1, b: 2 });
    });

    it("Should compact an object correctly", () => {
        expect(ObjectUtils.compact({ a: null, b: 2, c: undefined, d: 4 })).toEqual({ b: 2, d: 4 });
        expect(ObjectUtils.compact({ a: null, b: 2, c: false, d: 4 })).toEqual({ b: 2, c: false, d: 4 });
    });
});
