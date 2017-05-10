import { Attr, ListAttr, Model, Record, RecordMissingExtendsError, RecordSetAttributeError } from "app/core";
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

@Model()
class SimpleTestRec extends Record {
    @Attr()
    public id: string;

    @Attr()
    public a: number;

    @Attr()
    public b: number;

    @Attr()
    public c: number;
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
        expect(list.get(0) instanceof NestedRec).toBe(true, "Item 0 in list should be of nested type");
        expect(list.get(0).name).toEqual("name-1");
        expect(list.get(1) instanceof NestedRec).toBe(true, "Item 1 in list should be of nested type");
        expect(list.get(1).name).toEqual("name-2");
        expect(list.get(2) instanceof NestedRec).toBe(true, "Item 2 in list should be of nested type");
        expect(list.get(2).name).toEqual("default-name");
    });

    it("should not allow to set attributes after created", () => {
        const record = new SimpleTestRec({ a: 1, b: 2 });

        try {
            record.a = 3;
            expect(false).toBe(true, "Should have caught an error");
        } catch (e) {
            expect(e instanceof RecordSetAttributeError).toBe(true, "Throw an excpetion as expected");
        }
    });

    it("should pass record of the same type", () => {
        const a = new TestRec({ id: "some-id" });
        const c = new SimpleTestRec(a);
        expect(new TestRec(a)).toBe(a, "IF applying constructor again it should just return the same object");
        expect(c instanceof SimpleTestRec).toBe(true);
        expect(c.id).toEqual(a.id);
    });

    it("is a value type and equals other similar Records", () => {
        let t1 = new SimpleTestRec({ a: 10 });
        let t2 = new SimpleTestRec({ a: 10, b: 2 });
        expect(t1.equals(t2));
    });

    it("skips unknown keys", () => {
        let record = new SimpleTestRec({ a: 29, d: 12, u: 2 });

        expect(record.a).toBe(29);
        expect(record.get("d")).toBeUndefined();
        expect(record.get("u")).toBeUndefined();
    });

    it("toJS() returns correct values", () => {
        let a = new SimpleTestRec({ a: 29, b: 12, u: 2 });
        expect(a.toJS()).toEqual({ id: undefined, a: 29, b: 12, c: undefined });

        let b = new TestRec({ id: "id-1", nested: { name: "name-1", other: "invalid" }, nestedList: [{}] });
        expect(b.toJS()).toEqual({ id: "id-1", nested: { name: "name-1" }, nestedList: [{ name: "default-name" }] });
    });

    fit("should have access to values in constructor", () => {
        @Model()
        class ComputedValueRec extends Record {
            @Attr()
            public a = 1;

            @Attr()
            public b = 2;

            public computedA;
            public computedB;
            constructor(data: any) {
                super(data);
                this.computedA = `A${this.a}`;
                this.computedB = `B${this.b}`;
            }
        }
        const rec1 = new ComputedValueRec({});
        expect(rec1.computedA).toEqual("A1");
        expect(rec1.computedB).toEqual("B2");

        const rec2 = new ComputedValueRec({ a: 3, b: 50 });
        expect(rec2.computedA).toEqual("A3");
        expect(rec2.computedB).toEqual("B50");
    });
});
