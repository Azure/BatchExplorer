import { FilterBuilder, FilterMatcher } from "@batch-flask/core/filter-builder";

const matcher = new FilterMatcher();

describe("FilterMatcher", () => {
    it("should match simple property", () => {
        const filter = FilterBuilder.prop("id").eq("id-1");
        expect(matcher.test(filter, { id: "id-1", name: "name-1" })).toBe(true);
        expect(matcher.test(filter, { id: "id-1", name: "name-2" })).toBe(true);
        expect(matcher.test(filter, { id: "id-2", name: "name-1" })).toBe(false);
    });

    it("should match filter with and", () => {
        const filter1 = FilterBuilder.prop("id").eq("id-1");
        const filter2 = FilterBuilder.prop("name").eq("name-1");
        const filter = FilterBuilder.and(filter1, filter2);
        expect(matcher.test(filter, { id: "id-1", name: "name-1" })).toBe(true);
        expect(matcher.test(filter, { id: "id-1", name: "name-2" })).toBe(false);
        expect(matcher.test(filter, { id: "id-2", name: "name-1" })).toBe(false);
    });

    it("should match filter with or", () => {
        const filter1 = FilterBuilder.prop("id").eq("id-1");
        const filter2 = FilterBuilder.prop("name").eq("name-1");
        const filter = FilterBuilder.or(filter1, filter2);
        expect(matcher.test(filter, { id: "id-1", name: "name-1" })).toBe(true);
        expect(matcher.test(filter, { id: "id-1", name: "name-2" })).toBe(true);
        expect(matcher.test(filter, { id: "id-2", name: "name-1" })).toBe(true);
        expect(matcher.test(filter, { id: "id-2", name: "name-2" })).toBe(false);
    });

    it("should match filter with complex", () => {
        const filter1 = FilterBuilder.prop("id").eq("id-1");
        const filter2 = FilterBuilder.or(
            FilterBuilder.prop("name").eq("name-1"),
            FilterBuilder.prop("name").eq("name-2"));
        const filter = FilterBuilder.and(filter1, filter2);
        expect(matcher.test(filter, { id: "id-1", name: "name-1" })).toBe(true);
        expect(matcher.test(filter, { id: "id-1", name: "name-2" })).toBe(true, "id-1 and name-2 should match");
        expect(matcher.test(filter, { id: "id-2", name: "name-1" })).toBe(false, "Not matching id-2");
        expect(matcher.test(filter, { id: "id-1", name: "name-3" })).toBe(false, "Not matching name-3");
    });

    it("should match nested property", () => {
        const filter = FilterBuilder.prop("info/state").eq("running");
        expect(matcher.test(filter, { id: "id-1", name: "name-1", info: { state: "running" } })).toBe(true);
        expect(matcher.test(filter, { id: "id-2", name: "name-1", info: { state: "active" } })).toBe(false);
    });

    describe("when testing a string", () => {
        it("should filter Equal", () => {
            const filter = FilterBuilder.prop("name").eq("some-1");

            expect(matcher.test(filter, { id: "id-1", name: "some-1" })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", name: "other-1" })).toBe(false);
        });

        it("should filter not Equal", () => {
            const filter = FilterBuilder.prop("name").ne("some-1");

            expect(matcher.test(filter, { id: "id-2", name: "other-1" })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", name: "some-1" })).toBe(false);
        });

        it("should filter startsWith", () => {
            const filter = FilterBuilder.prop("name").startswith("some");

            expect(matcher.test(filter, { id: "id-1", name: "some-1" })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", name: "some2" })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", name: "some-value" })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", name: "other-1" })).toBe(false);
        });
    });

    describe("when testing a number", () => {
        it("should filter Equal", () => {
            const filter = FilterBuilder.prop("priority").eq(2);

            expect(matcher.test(filter, { id: "id-1", priority: 2 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: 1 })).toBe(false);
        });

        it("should filter not Equal", () => {
            const filter = FilterBuilder.prop("priority").ne(2);

            expect(matcher.test(filter, { id: "id-1", priority: 1 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: 2 })).toBe(false);
        });

        it("should filter Less than", () => {
            const filter = FilterBuilder.prop("priority").lt(2);

            expect(matcher.test(filter, { id: "id-1", priority: 1 })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", priority: -4 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: 2 })).toBe(false);
            expect(matcher.test(filter, { id: "id-2", priority: 3 })).toBe(false);
        });
        it("should filter Less or equal", () => {
            const filter = FilterBuilder.prop("priority").le(2);

            expect(matcher.test(filter, { id: "id-1", priority: 1 })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", priority: -4 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: 2 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: 3 })).toBe(false);
        });
        it("should filter Greater than", () => {
            const filter = FilterBuilder.prop("priority").gt(2);

            expect(matcher.test(filter, { id: "id-1", priority: 3 })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", priority: 12 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: 2 })).toBe(false);
            expect(matcher.test(filter, { id: "id-2", priority: -2 })).toBe(false);
        });
        it("should filter Greater or equal", () => {
            const filter = FilterBuilder.prop("priority").ge(2);

            expect(matcher.test(filter, { id: "id-1", priority: 3 })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", priority: 12 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: 2 })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", priority: -2 })).toBe(false);
        });
    });

    describe("when testing a date", () => {
        it("should filter Equal", () => {
            const filter = FilterBuilder.prop("starTime").eq(new Date(2018, 2, 3, 4, 5, 44));

            expect(matcher.test(filter, { id: "id-1", starTime: new Date(2018, 2, 3, 4, 5, 44) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 45) })).toBe(false);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2017, 2, 3, 4, 5, 44) })).toBe(false);
        });

        it("should filter not Equal", () => {
            const filter = FilterBuilder.prop("starTime").ne(new Date(2018, 2, 3, 4, 5, 44));

            expect(matcher.test(filter, { id: "id-1", starTime: new Date(2018, 2, 3, 4, 5, 44) })).toBe(false);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 45) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2017, 2, 3, 4, 5, 44) })).toBe(true);
        });

        it("should filter Less than", () => {
            const filter = FilterBuilder.prop("starTime").lt(new Date(2018, 2, 3, 4, 5, 44));

            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 43) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2017, 2, 3, 4, 5, 44) })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", starTime: new Date(2018, 2, 3, 4, 5, 44) })).toBe(false);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 45) })).toBe(false);
        });
        it("should filter Less or equal", () => {
            const filter = FilterBuilder.prop("starTime").le(new Date(2018, 2, 3, 4, 5, 44));

            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 43) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2017, 2, 3, 4, 5, 44) })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", starTime: new Date(2018, 2, 3, 4, 5, 44) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 45) })).toBe(false);
        });
        it("should filter Greater than", () => {
            const filter = FilterBuilder.prop("starTime").gt(new Date(2018, 2, 3, 4, 5, 44));

            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 45) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2019, 2, 3, 4, 5, 44) })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", starTime: new Date(2018, 2, 3, 4, 5, 44) })).toBe(false);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 43) })).toBe(false);
        });
        it("should filter Greater or equal", () => {
            const filter = FilterBuilder.prop("starTime").ge(new Date(2018, 2, 3, 4, 5, 44));

            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 45) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2019, 2, 3, 4, 5, 44) })).toBe(true);
            expect(matcher.test(filter, { id: "id-1", starTime: new Date(2018, 2, 3, 4, 5, 44) })).toBe(true);
            expect(matcher.test(filter, { id: "id-2", starTime: new Date(2018, 2, 3, 4, 5, 43) })).toBe(false);
        });
    });
});
