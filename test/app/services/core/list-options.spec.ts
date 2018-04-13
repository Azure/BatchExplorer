import { FilterBuilder } from "@batch-flask/core";
import { ListOptions } from "app/services/core";

const fooFilter = FilterBuilder.prop("foo").eq("bar");
const myFilter = FilterBuilder.prop("foo").eq("myFilter");

describe("ListOptions", () => {
    it("should extract the filter attribute", () => {
        const options = new ListOptions({ filter: fooFilter, param1: "bar" });
        expect(options.filter).toEqual(fooFilter);
        expect(options.attributes).toEqual({ param1: "bar" });
        expect(options.original).toEqual({ filter: fooFilter, param1: "bar" });
    });

    it("should extract the select attribute", () => {
        const options = new ListOptions({ select: "foo", param1: "bar" });
        expect(options.select).toEqual("foo");
        expect(options.attributes).toEqual({ param1: "bar" });
        expect(options.original).toEqual({ select: "foo", param1: "bar" });
    });

    it("should extract the pageSize attribute", () => {
        const options = new ListOptions({ pageSize: 5, param1: "bar" });
        expect(options.pageSize).toEqual(5);
        expect(options.attributes).toEqual({ param1: "bar" });
        expect(options.original).toEqual({ pageSize: 5, param1: "bar" });
    });

    it("should extract the maxItems attribute", () => {
        const options = new ListOptions({ maxItems: 5, param1: "bar" });
        expect(options.maxItems).toEqual(5);
        expect(options.attributes).toEqual({ param1: "bar" });
        expect(options.original).toEqual({ maxItems: 5, param1: "bar" });
    });

    describe("#isEmpty", () => {
        it("should return true when no params given", () => {
            expect(new ListOptions({}).isEmpty()).toBe(true);
        });

        it("should return false when some params", () => {
            expect(new ListOptions({ filter: fooFilter }).isEmpty()).toBe(false);
            expect(new ListOptions({ param1: "bar" }).isEmpty()).toBe(false);
        });
    });

    describe("#maxResults", () => {
        it("should return null if pageSize and maxItems not provided", () => {
            const options = new ListOptions({});
            expect(options.maxResults).toEqual(null);
        });

        it("should use pageSize if maxItems is not provided", () => {
            const options = new ListOptions({ pageSize: 5 });
            expect(options.maxResults).toEqual(5);
        });

        it("should use maxItems if pageSize is not provided", () => {
            const options = new ListOptions({ maxItems: 10 });
            expect(options.maxResults).toEqual(10);
        });

        it("should use maxItems if smaller than pageSize", () => {
            const options = new ListOptions({ maxItems: 5, pageSize: 10 });
            expect(options.maxResults).toEqual(5);
        });

        it("should use pageSize if smaller than maxItems", () => {
            const options = new ListOptions({ maxItems: 5, pageSize: 10 });
            expect(options.maxResults).toEqual(5);
        });
    });

    describe("merge", () => {
        it("should merge", () => {
            const optionA = new ListOptions({ filter: myFilter, pageSize: 20, param1: "foo", param2: "bar" });
            const optionB = new ListOptions({ pageSize: 10, param1: "newFoo", param3: "Other" });
            const options = optionA.merge(optionB);
            expect(options.filter).toEqual(myFilter);
            expect(options.pageSize).toEqual(10);
            expect(options.original).toEqual({
                filter: myFilter, pageSize: 10,
                param1: "newFoo", param2: "bar", param3: "Other",
            });
        });
    });
});
