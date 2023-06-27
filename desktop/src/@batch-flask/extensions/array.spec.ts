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

    describe("#sortBy()", () => {
        it("should sort by given property", () => {
            const items = [
                { name: "foo1", age: 29 },
                { name: "foo2", age: 25 },
                { name: "foo3", age: 115 },
                { name: "foo4", age: 12 },
                { name: "foo5", age: 54 },
            ];

            const sorted = items.sortBy(x => x.age);

            expect(sorted.length).toBe(items.length);
            expect(sorted[0]).toEqual({ name: "foo4", age: 12 });
            expect(sorted[1]).toEqual({ name: "foo2", age: 25 });
            expect(sorted[2]).toEqual({ name: "foo1", age: 29 });
            expect(sorted[3]).toEqual({ name: "foo5", age: 54 });
            expect(sorted[4]).toEqual({ name: "foo3", age: 115 });
        });
    });
});
