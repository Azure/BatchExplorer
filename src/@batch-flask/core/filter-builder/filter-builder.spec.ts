import { FilterBuilder } from "@batch-flask/core";

// tslint:disable:max-line-length
describe("Filter builder", () => {
    it("filter parser handles ONE search parameter", () => {
        const builder = FilterBuilder.prop("displayName").startswith("bob");
        expect(builder.toOData()).toEqual("startswith(displayName, 'bob')");
    });

    it("oData filter parser handles TWO search parameters", () => {
        const prop1 = FilterBuilder.prop("displayName").startswith("bob");
        const prop2 = FilterBuilder.prop("state").eq("active");
        const builder = FilterBuilder.or(prop1, prop2);

        expect(builder.toOData()).toEqual("(startswith(displayName, 'bob') or state eq 'active')");
    });

    it("filter generate OData for right types", () => {

        const date = new Date(2016, 4, 2, 21, 1, 0);
        expect(FilterBuilder.prop("strAttr").eq("bob").toOData()).toEqual("strAttr eq 'bob'");
        expect(FilterBuilder.prop("intAttr").eq(213).toOData()).toEqual("intAttr eq 213");
        expect(FilterBuilder.prop("boolAttr").eq(true).toOData()).toEqual("boolAttr eq true");
        expect(FilterBuilder.prop("dateAttr").eq(date).toOData()).toEqual(`dateAttr eq datetime'${date.toISOString()}'`);
    });

    it("Join ignore null queries", () => {
        const prop1 = FilterBuilder.prop("displayName").startswith("bob");
        const prop2 = FilterBuilder.prop("state").eq("active");
        const builder = FilterBuilder.or(prop1, null, prop2, undefined);

        expect(builder.toOData()).toEqual("(startswith(displayName, 'bob') or state eq 'active')");
    });

    it("oData filter parser handles complex or+and query", () => {
        const prop1 = FilterBuilder.prop("displayName").startswith("bob");
        const prop2 = FilterBuilder.prop("state").eq("creating");
        const prop3 = FilterBuilder.prop("state").eq("deleting");
        const builder = FilterBuilder.and(prop1, FilterBuilder.or(prop2, prop3, prop3));

        const expected = "(startswith(displayName, 'bob') and (state eq 'creating' or state eq 'deleting' or state eq 'deleting'))";
        expect(builder.toOData()).toEqual(expected);
    });
});
