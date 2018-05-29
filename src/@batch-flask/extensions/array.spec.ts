import "./array";

describe("Array extensions", () => {
    describe("#first()", () => {
        it("should return the first element", () => {
            expect(["a", "b"].first()).toEqual("a");
            expect(["c"].first()).toEqual("c");
        });

        it("should return undefined if array is empty", () => {
            expect([].first()).toEqual(undefined);
        });
    });

    describe("#last()", () => {
        it("should return the first element", () => {
            expect(["a", "b"].last()).toEqual("b");
            expect(["c"].last()).toEqual("c");
        });

        it("should return undefined if array is empty", () => {
            expect([].last()).toEqual(undefined);
        });
    });

    describe("#flatten()", () => {
        it("should flatten", () => {
            expect([[1, 2], [3, 4]].flatten()).toEqual([1, 2, 3, 4]);
        });
    });
});
