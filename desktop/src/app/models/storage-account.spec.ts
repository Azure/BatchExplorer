import { StorageAccount } from "app/models";

describe("Node Model", () => {
    it("lower case the id", () => {
        const account1 = new StorageAccount({ id: "sub-1/My-Resource-GrOUP/storage-1", name: "storage-1" } as any);
        const account2 = new StorageAccount({ id: "sub-1/my-resource-group/storage-1", name: "storage-1" } as any);
        expect(account1.id).toEqual(account2.id);
        expect(account1).toEqualImmutable(account2);
    });
});
