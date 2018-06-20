import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";

class FakeNestedDto extends Dto<FakeNestedDto> {
    @DtoAttr() public foo: string;
    @DtoAttr() public name: string;
}

class FakeDto extends Dto<FakeDto> {
    @DtoAttr() public id: string;

    @DtoAttr() public num?: number;

    @DtoAttr() public obj?: { a: string, b: string };

    @DtoAttr() public nested?: FakeNestedDto;
    @ListDtoAttr(FakeNestedDto) public nestedList?: FakeNestedDto[];
}

fdescribe("Dto", () => {
    it("should not set attributes not in the list", () => {
        const dto = new FakeDto({ id: "foo", other: "wrong", other2: { nested: true } } as any);
        expect(dto.id).toEqual("foo");
        expect((dto as any).other).toBeUndefined();
        expect((dto as any).other2).toBeUndefined();
    });

    it("should assign primitive types correctly", () => {
        const dto = new FakeDto({ id: "foo", num: 3, obj: { a: "1", b: "2" } });
        expect(dto.id).toEqual("foo");
        expect(dto.num).toEqual(3);
        expect(dto.obj).toEqual({ a: "1", b: "2" });
    });

    it("should assign nested dto types correctly", () => {
        const dto = new FakeDto({ id: "foo", nested: { foo: "bar", name: null } });
        expect(dto.id).toEqual("foo");
        const nested = dto.nested;
        expect(nested).not.toBeUndefined();
        expect(nested instanceof FakeNestedDto).toBe(true);
        expect(nested.foo).toEqual("bar");
        expect(nested.name).toBeUndefined();
    });

    it("should not assign unknown nested dto types correctly", () => {
        const dto = new FakeDto({ id: "foo", nested: { foo: "bar", other: "wrong" } } as any);
        const nested = dto.nested;
        expect(nested).not.toBeUndefined();
        expect(nested instanceof FakeNestedDto).toBe(true);
        expect((nested as any).other).toBeUndefined("bar");
    });

    it("should merge with another dto", () => {
        const base = new FakeDto({ id: "foo", nested: { foo: "bar", other: "wrong" } } as any);
        const overrides = new FakeDto({ id: "foo2", num: 3 } as any);
        const result = base.merge(overrides);

        expect(result.id).toEqual("foo2");
        expect(result.num).toEqual(3);
        const nested = result.nested;
        expect(nested).not.toBeUndefined();
        expect(nested instanceof FakeNestedDto).toBe(true);
        expect((nested as any).other).toBeUndefined("bar");
    });

    it("handle nested list dto", () => {
        const dto = new FakeDto({
            id: "foo",
            nestedList: [{ foo: "bar", name: null, other: "with-value" }],
        } as any);
        const nestedList = dto.nestedList;
        expect(nestedList).not.toBeUndefined();
        expect(nestedList.length).toBe(1);
        expect(nestedList[0] instanceof FakeNestedDto).toBe(true);
        expect(nestedList[0].name).toBeUndefined();
        expect((nestedList[0] as any).other).toBeUndefined();
    });

    it("remove null attributes when toJS()", () => {
        const dto = new FakeDto({
            id: "foo",
            nested: { foo: null, name: "some" },
            nestedList: [{ foo: "bar", name: null }],
        });

        const result = dto.toJS();
        expect(result.nested).not.toBeUndefined();
        expect(result.nested.name).toBe("some");
        expect("foo" in result.nested).toBe(false);

        expect(result.nestedList).not.toBeUndefined();
        expect(result.nestedList.length).toBe(1);
        expect(result.nestedList[0].foo).toBe("bar");
        expect("name" in result.nestedList[0]).toBe(false);
    });
});
