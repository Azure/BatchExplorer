import { ArmRecord, Model, Prop } from "@batch-flask/core";

@Model()
class TestModel extends ArmRecord<any> {
    @Prop() public id: string;

    @Prop() public name: string;
}

describe("Node Model", () => {
    it("lower case the id", () => {
        const model1 = new TestModel({ id: "sub-1/My-Resource-GrOUP/storage-1", name: "storage-1" } as any);
        const model2 = new TestModel({ id: "sub-1/my-resource-group/storage-1", name: "storage-1" } as any);
        expect(model1.id).toEqual(model2.id);
        expect(model1).toEqualImmutable(model2);
    });
});
