import { initMockEnvironment } from "@batch/ui-common/lib/environment";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { FakePoolService } from "../fake-pool-service";
import { Pool } from "../pool-models";

describe("FakePoolService", () => {
    const hoboAcctId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo";

    let service: FakePoolService;
    let fakeSet: FakeSet;

    beforeEach(() => {
        initMockEnvironment();
        fakeSet = new BasicFakeSet();
        service = new FakePoolService();
        service.setFakes(fakeSet);
    });

    test("List by account", async () => {
        const pools = await service.listByAccountId(hoboAcctId);
        expect(pools.map((pool) => pool.name)).toEqual(["hobopool1"]);
    });

    test("Get by resource ID", async () => {
        const pool = await service.get(
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1"
        );
        expect(pool?.name).toEqual("hobopool1");
    });

    test("Create", async () => {
        const newPool: Pool = {
            id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/newtestpool",
            name: "newtestpool",
            type: "Microsoft.Batch/batchAccounts/pools",
            properties: {
                vmSize: "STANDARD_DS4_V2",
                deploymentConfiguration: {
                    virtualMachineConfiguration: {
                        imageReference: {
                            publisher: "Canonical",
                            offer: "0001-com-ubuntu-server-focal",
                            sku: "20_04-lts",
                        },
                        nodeAgentSkuId: "batch.node.ubuntu 20.04",
                    },
                },
                scaleSettings: {
                    fixedScale: {
                        targetDedicatedNodes: 0,
                        targetLowPriorityNodes: 0,
                    },
                },
                currentDedicatedNodes: 0,
                currentLowPriorityNodes: 0,
            },
        };

        const pool = await service.createOrUpdate(newPool);
        expect(pool?.name).toEqual("newtestpool");

        const pools = await service.listByAccountId(hoboAcctId);
        expect(pools.map((pool) => pool.name)).toEqual([
            "hobopool1",
            "newtestpool",
        ]);
    });

    test("Update", async () => {
        const poolUpdate: Pool = {
            id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1",
            name: "hobopool1",
            type: "Microsoft.Batch/batchAccounts/pools",
            properties: {
                vmSize: "STANDARD_DS4_V2",
                deploymentConfiguration: {
                    virtualMachineConfiguration: {
                        imageReference: {
                            publisher: "Canonical",
                            offer: "0001-com-ubuntu-server-focal",
                            sku: "20_04-lts",
                        },
                        nodeAgentSkuId: "batch.node.ubuntu 20.04",
                    },
                },
                scaleSettings: {
                    fixedScale: {
                        targetDedicatedNodes: 0,
                        targetLowPriorityNodes: 0,
                    },
                },
            },
        };

        const pool = await service.createOrUpdate(poolUpdate);
        expect(pool?.name).toEqual("hobopool1");

        // Updated an existing pool rather than created a new one
        const pools = await service.listByAccountId(hoboAcctId);
        expect(pools.map((pool) => pool.name)).toEqual(["hobopool1"]);
    });

    test("Patch", async () => {
        // Scale up to 10 dedicated nodes
        const update: Pool = {
            id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1",
            name: "hobopool1",
            type: "Microsoft.Batch/batchAccounts/pools",
            properties: {
                scaleSettings: {
                    fixedScale: {
                        targetDedicatedNodes: 10,
                    },
                },
            },
        };

        const pool = await service.patch(update);
        expect(pool?.name).toEqual("hobopool1");
        expect(
            pool?.properties?.scaleSettings?.fixedScale?.targetDedicatedNodes
        ).toBe(10);

        // Updated an existing pool rather than created a new one
        const pools = await service.listByAccountId(hoboAcctId);
        expect(pools.map((pool) => pool.name)).toEqual(["hobopool1"]);
    });
});
