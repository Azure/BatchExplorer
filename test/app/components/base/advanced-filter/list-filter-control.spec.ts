
import { ListFilterControl, ListFilterType } from "@batch-flask/ui/advanced-filter";

describe("AdvancedFilterListComponent", () => {
    let control: ListFilterControl;

    beforeEach(() => {
        control = new ListFilterControl("My list filter");
    });

    describe("when no number and no range", () => {
        beforeEach(() => {
            control = new ListFilterControl("My list filter");
            control.name = "attr";
        });

        it("should split items", () => {
            expect(control.parseValue("a")).toEqual({ items: ["a"], ranges: [] });
            expect(control.parseValue("a,b")).toEqual({ items: ["a", "b"], ranges: [] });
            expect(control.parseValue("a,3,4")).toEqual({ items: ["a", "3", "4"], ranges: [] });
        });

        it("should not extract ranges", () => {
            expect(control.parseValue("a,c|d")).toEqual({ items: ["a", "c|d"], ranges: [] });
            expect(control.parseValue("a|z,c|d")).toEqual({ items: ["a|z", "c|d"], ranges: [] });
        });

        it("should not extract numbers", () => {
            expect(control.parseValue("a,3,4")).toEqual({ items: ["a", "3", "4"], ranges: [] });
            expect(control.parseValue("a,3,4|10")).toEqual({ items: ["a", "3", "4|10"], ranges: [] });
        });

        it("build a filter without range or numbers", () => {
            const expectedInclude = "((attr eq 'a' or attr eq '3' or attr eq '4'))";
            const expectedExclude = "((attr ne 'a' and attr ne '3' and attr ne '4'))";
            const value = "a,3,4";
            expect(control.buildFilter({ value, type: ListFilterType.Include }).toOData()).toEqual(expectedInclude);
            expect(control.buildFilter({ value, type: ListFilterType.Exclude }).toOData()).toEqual(expectedExclude);
        });
    });

    describe("when number but no range", () => {
        beforeEach(() => {
            control = new ListFilterControl("My list filter", { number: true });
            control.name = "attr";
        });

        it("should split numbers", () => {
            expect(control.parseValue("1,2,5")).toEqual({ items: [1, 2, 5], ranges: [] });
            expect(control.parseValue("-489,29")).toEqual({ items: [-489, 29], ranges: [] });
        });

        it("should not extract ranges", () => {
            expect(control.parseValue("1,3|4")).toEqual({ items: [1], ranges: [] });
            expect(control.parseValue("100|200,-200|499")).toEqual({ items: [], ranges: [] });
        });

        it("should not include invalid numbers", () => {
            expect(control.parseValue("a,3,4")).toEqual({ items: [3, 4], ranges: [] });
            expect(control.parseValue("a,3,34ac")).toEqual({ items: [3], ranges: [] });
        });

        it("build a filter with numbers and no range", () => {
            const expectedInclude = "((attr eq 3 or attr eq 4))";
            const expectedExclude = "((attr ne 3 and attr ne 4))";
            const value = "a,3,4";
            expect(control.buildFilter({ value, type: ListFilterType.Include }).toOData()).toEqual(expectedInclude);
            expect(control.buildFilter({ value, type: ListFilterType.Exclude }).toOData()).toEqual(expectedExclude);
        });
    });

    describe("when range", () => {
        beforeEach(() => {
            control = new ListFilterControl("My list filter", { allowRanges: true });
            control.name = "attr";
        });

        it("should split items", () => {
            expect(control.parseValue("a")).toEqual({ items: ["a"], ranges: [] });
            expect(control.parseValue("a,b")).toEqual({ items: ["a", "b"], ranges: [] });
            expect(control.parseValue("a,3,4")).toEqual({ items: ["a", "3", "4"], ranges: [] });
        });

        it("should  extract ranges", () => {
            expect(control.parseValue("a,c|d")).toEqual({ items: ["a"], ranges: [["c", "d"]] });
            expect(control.parseValue("a|z,c|d")).toEqual({ items: [], ranges: [["a", "z"], ["c", "d"]] });
        });

        it("should not extract numbers", () => {
            expect(control.parseValue("a,3,4")).toEqual({ items: ["a", "3", "4"], ranges: [] });
            expect(control.parseValue("a,3,4|10")).toEqual({ items: ["a", "3"], ranges: [["4", "10"]] });
        });

        it("build a filter with range and no number", () => {
            const value = "a,3,4|10,a|z";

            const exactItemsInclude = "(attr eq 'a' or attr eq '3')";
            const rangeInclude = "(attr ge '4' and attr le '10') or (attr ge 'a' and attr le 'z')";
            const expectedInclude = `(${rangeInclude} or ${exactItemsInclude})`;
            expect(control.buildFilter({ value, type: ListFilterType.Include }).toOData()).toEqual(expectedInclude);

            const exactItemsExclude = "(attr ne 'a' and attr ne '3')";
            const rangeExclude = "(attr lt '4' or attr gt '10') and (attr lt 'a' or attr gt 'z')";
            const expectedExclude = `(${rangeExclude} and ${exactItemsExclude})`;
            expect(control.buildFilter({ value, type: ListFilterType.Exclude }).toOData()).toEqual(expectedExclude);
        });
    });

    describe("when number and range", () => {
        beforeEach(() => {
            control = new ListFilterControl("My list filter", { number: true, allowRanges: true });
            control.name = "attr";
        });

        it("should split numbers", () => {
            expect(control.parseValue("1,2,5")).toEqual({ items: [1, 2, 5], ranges: [] });
            expect(control.parseValue("-489,29")).toEqual({ items: [-489, 29], ranges: [] });
        });

        it("should  extract ranges", () => {
            expect(control.parseValue("1,3|4")).toEqual({ items: [1], ranges: [[3, 4]] });
            expect(control.parseValue("100|200,-200|499")).toEqual({ items: [], ranges: [[100, 200], [-200, 499]] });
        });

        it("should not include invalid numbers", () => {
            expect(control.parseValue("a,3,4,4a|d3")).toEqual({ items: [3, 4], ranges: [] });
            expect(control.parseValue("a,3,34ac")).toEqual({ items: [3], ranges: [] });
        });

        it("build a filter with range and number", () => {
            const value = "a,3,4|10,a|z";

            const expectedInclude = `((attr ge 4 and attr le 10) or (attr eq 3))`;
            expect(control.buildFilter({ value, type: ListFilterType.Include }).toOData()).toEqual(expectedInclude);

            const expectedExclude = `((attr lt 4 or attr gt 10) and (attr ne 3))`;
            expect(control.buildFilter({ value, type: ListFilterType.Exclude }).toOData()).toEqual(expectedExclude);
        });
    });
});
