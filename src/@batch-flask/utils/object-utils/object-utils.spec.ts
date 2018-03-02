import { ObjectUtils, exists, nil } from "./object-utils";

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

    it("exists should return true if not null or undefined", () => {
        expect(exists("abc")).toBe(true);
        expect(exists(123)).toBe(true);
        expect(exists([{}])).toBe(true);
        expect(exists("")).toBe(true);
        expect(exists(0)).toBe(true);
        expect(exists([])).toBe(true);

        expect(exists(null)).toBe(false);
        expect(exists(undefined)).toBe(false);
    });

    it("nil should return true if null or undefined", () => {
        expect(nil("abc")).toBe(false);
        expect(nil(123)).toBe(false);
        expect(nil([{}])).toBe(false);
        expect(nil("")).toBe(false);
        expect(nil(0)).toBe(false);
        expect(nil([])).toBe(false);

        expect(nil(null)).toBe(true);
        expect(nil(undefined)).toBe(true);
    });

    it("serialize object", () => {
        const s1 = ObjectUtils.serialize({ a: 1, b: 2 });
        const s2 = ObjectUtils.serialize({ b: 2, a: 1 });
        const s3 = ObjectUtils.serialize({ b: 3, a: 1 });
        expect(s1).toEqual(s2);
        expect(s1).not.toEqual(s3);
        expect(ObjectUtils.serialize(null)).toEqual("");
        expect(ObjectUtils.serialize(undefined)).toEqual("");
    });
});
