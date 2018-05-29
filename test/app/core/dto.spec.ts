import { Dto, DtoAttr } from "@batch-flask/core";

class FakeNestedDto extends Dto<FakeNestedDto> {
    @DtoAttr()
    public foo: string;
}

class FakeDto extends Dto<FakeDto> {
    @DtoAttr()
    public id: string;

    @DtoAttr()
    public num?: number;

    @DtoAttr()
    public obj?: { a: string, b: string };

    @DtoAttr()
    public nested?: FakeNestedDto;
}

describe("Dto", () => {
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
        const dto = new FakeDto({ id: "foo", nested: { foo: "bar" } });
        expect(dto.id).toEqual("foo");
        const nested = dto.nested;
        expect(nested).not.toBeUndefined();
        expect(nested instanceof FakeNestedDto).toBe(true);
        expect(nested.foo).toEqual("bar");
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
});
