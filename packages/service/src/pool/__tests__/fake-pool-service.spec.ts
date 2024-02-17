import { FakePoolService } from "../fake-pool-service";
import { Pool } from "../pool-models";
import { BasicBatchFakeSet, BatchFakeSet } from "../../test-util/fakes";
import { initMockBatchEnvironment } from "../../environment";

describe("FakePoolService", () => {
    const hoboAcctId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo";
    const hoboPoolArmId = `${hoboAcctId}/pools/hobopool1`;
    const newTestPoolArmId = `${hoboAcctId}/pools/newtestpool`;

    const byosAcctId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization/providers/Microsoft.Batch/batchAccounts/byos";
    const byosPoolArmId = `${byosAcctId}/pools/byospool1`;

    let service: FakePoolService;
    let fakeSet: BatchFakeSet;

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakePoolService();
        service.setFakes(fakeSet);
    });

    test("List by account", async () => {
        const pools = await service.listByAccountId(hoboAcctId);
        expect(pools.map((pool) => pool.name)).toEqual(["hobopool1"]);
    });

    test("Get by resource ID", async () => {
        const hoboPool = await service.get(hoboPoolArmId);
        expect(hoboPool?.name).toEqual("hobopool1");

        const byosPool = await service.get(byosPoolArmId);
        expect(byosPool?.name).toEqual("byospool1");
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

        const pool = await service.createOrUpdate(newTestPoolArmId, newPool);
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

        const pool = await service.createOrUpdate(hoboPoolArmId, poolUpdate);
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

        const pool = await service.patch(hoboPoolArmId, update);
        expect(pool?.name).toEqual("hobopool1");
        expect(
            pool?.properties?.scaleSettings?.fixedScale?.targetDedicatedNodes
        ).toBe(10);

        // Updated an existing pool rather than created a new one
        const pools = await service.listByAccountId(hoboAcctId);
        expect(pools.map((pool) => pool.name)).toEqual(["hobopool1"]);
    });
});
