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
});
