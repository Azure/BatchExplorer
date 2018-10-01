import { PoolCreateDto } from "./pool-create.dto";

describe("PoolCreateDto", () => {
    it("set the virtual machine configuration correctly", () => {
        const dto = new PoolCreateDto({
            id: "centos-73-test",
            virtualMachineConfiguration: {
                nodeAgentSKUId: "batch.node.centos 7",
                invalid: "extra-keey", // Shouldn't keep this value
                imageReference: {
                    publisher: "OpenLogic",
                    offer: "CentOS",
                    sku: "7.3",
                    version: "latest",
                    virtualMachineId: "some-id", // Shouldn't keep this value
                },
            },
        } as any);

        expect(dto.toJS()).toEqual({
            id: "centos-73-test",
            virtualMachineConfiguration: {
                nodeAgentSKUId: "batch.node.centos 7",
                imageReference: {
                    publisher: "OpenLogic",
                    offer: "CentOS",
                    sku: "7.3",
                    version: "latest",
                },
            },
        } as any);
    });
});
