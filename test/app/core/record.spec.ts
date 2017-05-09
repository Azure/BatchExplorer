import { Attr, ListAttr, Model, Record, RecordMissingExtendsError } from "app/core";
import { List } from "immutable";

@Model()
class NestedRec extends Record {
    @Attr()
    public name: string = "default-name";
}

@Model()
class TestRec extends Record {
    @Attr()
    public id: string = "default-id";

    @Attr()
    public nested: NestedRec;

    @ListAttr(NestedRec)
    public nestedList: List<NestedRec> = List([]);
}



fdescribe("Record", () => {
    it("should throw an expecption when record doesn't extends Record class", () => {
        try {
            @Model()
            class MissingExtendRecord {
                @Attr()
                public name: string;
            }
            expect(true).toBe(false, "Should have thrown an expecption");
        } catch (e) {
            expect(true).toBe(true, "Throw an excpetion as expected");
            expect(e instanceof RecordMissingExtendsError).toBe(true, "Throw an excpetion as expected");
        }
    });

    it("should set the defaults", () => {
        const record = new TestRec();
        expect(record.id).toEqual("default-id");
        expect(record.nested).toBe(undefined);
        expect(record.nestedList).toEqual(List([]));
    });

    it("should set basic value", () => {
        const record = new TestRec({ id: "some-id" });
        expect(record.id).toEqual("some-id");
    });

    it("should set nested value", () => {
        const record = new TestRec({ nested: { name: "some-name" } });
        expect(record.nested).not.toBeFalsy();
        expect(record.nested instanceof NestedRec).toBe(true);
        expect(record.nested.name).toEqual("some-name");
    });

    it("should set list attributes", () => {
        const record = new TestRec({ nestedList: [{ name: "name-1" }, { name: "name-2" }, {}] });
        const list = record.nestedList;
        expect(list).not.toBeFalsy();
        expect(list instanceof List).toBe(true);
        expect(list.size).toBe(3);
        console.log("Klist", record.nestedList[0]);
        expect(list.get(0) instanceof NestedRec).toBe(true, "Item 0 in list should be of nested type");
        expect(list.get(0).name).toEqual("name-1");
        expect(list.get(1) instanceof NestedRec).toBe(true, "Item 1 in list should be of nested type");
        expect(list.get(1).name).toEqual("name-2");
        expect(list.get(2) instanceof NestedRec).toBe(true, "Item 2 in list should be of nested type");
        expect(list.get(2).name).toEqual("default-name");
    });
});
