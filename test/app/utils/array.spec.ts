import { ArrayUtils } from "app/utils";

describe("ArrayUtils", () => {
    describe("#chunk()", () => {
        it("when array is smaller than chunk size", () => {
            const out = ArrayUtils.chunk(["a", "b", "c"], 5);
            expect(out).toEqual([["a", "b", "c"]]);
        });

        it("when array more than 1 chunk", () => {
            const out = ArrayUtils.chunk(["a", "b", "c", "d", "e", "f"], 5);
            expect(out).toEqual([["a", "b", "c", "d", "e"], ["f"]]);
        });

        it("when array many chunks", () => {
            const out = ArrayUtils.chunk(["a", "b", "c", "d", "e", "f", "g", "h"], 2);
            expect(out).toEqual([["a", "b"], ["c", "d"], ["e", "f"], ["g", "h"]]);
        });
    });
});
