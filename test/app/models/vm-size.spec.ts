import { VmSize } from "app/models";

describe("Node Model", () => {
    it("lower case the id", () => {
        const size1 = new VmSize({ name: "Standard_A1"} as any);
        const size2 = new VmSize({ name: "standard_a1" } as any);
        expect(size1.id).toEqual(size1.id);
        expect(size2).toEqualImmutable(size2);
    });
});
