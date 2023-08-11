import {
    initMockEnvironment,
    getMockEnvironment,
} from "@batch/ui-common/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { Endpoints, ApiVersion } from "../../constants";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { LivePoolService } from "../live-pool-service";
import { PoolService } from "../pool-service";
import type { Pool } from "../pool-models";
import { cloneDeep, mergeDeep } from "@batch/ui-common";

describe("LivePoolService", () => {
    const hoboAcctId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo";
    const hoboPoolOneId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1";

    let service: PoolService;
    let fakeSet: FakeSet;

    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LivePoolService();
        fakeSet = new BasicFakeSet();
    });

    test("List by account", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${hoboAcctId}/pools?api-version=${ApiVersion.batch.arm}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listPoolsByAccount(hoboAcctId),
                    }),
                }
            )
        );

        const pools = await service.listByAccountId(hoboAcctId);
        expect(pools.length).toBe(1);
        expect(pools.map((pool) => pool.name)).toEqual(["hobopool1"]);
    });

    test("List by account error", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${hoboAcctId}/pools?api-version=${ApiVersion.batch.arm}`,
                {
                    status: 500,
                    body: "Boom",
                }
            )
        );

        expect(() => service.listByAccountId(hoboAcctId)).rejects.toThrowError(
            `Failed to list pools under account ${hoboAcctId} [unexpected 500 status]\nResponse body:\nBoom`
        );
    });

    test("Get by resource ID", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${hoboPoolOneId}?api-version=${ApiVersion.batch.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(fakeSet.getPool(hoboPoolOneId)),
                }
            )
        );

        const pool = await service.get(hoboPoolOneId);
        expect(pool?.name).toEqual("hobopool1");
    });

    test("Get by resource ID error", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${hoboPoolOneId}?api-version=${ApiVersion.batch.arm}`,
                {
                    status: 500,
                    body: "Boom",
                }
            )
        );

        expect(() => service.get(hoboPoolOneId)).rejects.toThrowError(
            `Failed to get pool by ID ${hoboPoolOneId} [unexpected 500 status]\nResponse body:\nBoom`
        );
    });

    test("Create, update, patch", async () => {
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

        const newPoolJSON = JSON.stringify(newPool);

        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${newPool.id}?api-version=${ApiVersion.batch.arm}`,
                {
                    status: 200,
                    // TODO: It would be nice to have some faking code
                    //       that emulates the service a bit, adding fields
                    //       such as lastModified, defaulting values, etc.
                    body: newPoolJSON,
                }
            ),
            {
                method: "PUT",
                body: newPoolJSON,
            }
        );

        // Create
        let pool = await service.createOrUpdate(newPool);
        expect(pool?.name).toEqual("newtestpool");

        if (newPool.properties?.scaleSettings?.fixedScale) {
            newPool.properties.scaleSettings.fixedScale.targetDedicatedNodes = 10;
            newPool.properties.scaleSettings.fixedScale.targetLowPriorityNodes = 5;
        }

        const updatedPoolJSON = JSON.stringify(newPool);

        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${newPool.id}?api-version=${ApiVersion.batch.arm}`,
                {
                    status: 200,
                    // TODO: It would be nice to have some faking code
                    //       that emulates the service a bit, adding fields
                    //       such as lastModified, defaulting values, etc.
                    body: updatedPoolJSON,
                }
            ),
            {
                method: "PUT",
                body: updatedPoolJSON,
            }
        );

        // Update
        pool = await service.createOrUpdate(newPool);
        expect(pool?.name).toEqual("newtestpool");

        const patch: Pool = {
            id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/newtestpool",
            properties: {
                scaleSettings: {
                    fixedScale: {
                        targetDedicatedNodes: 20,
                    },
                },
            },
        };
        const patchedPool = mergeDeep(cloneDeep(newPool), patch);
        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${newPool.id}?api-version=${ApiVersion.batch.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(patchedPool),
                }
            ),
            {
                method: "PATCH",
                body: JSON.stringify(patch),
            }
        );

        // Patch
        pool = await service.patch(patch);
        expect(pool?.name).toEqual("newtestpool");
        expect(
            pool?.properties?.scaleSettings?.fixedScale?.targetDedicatedNodes
        ).toEqual(20);
        expect(
            pool?.properties?.scaleSettings?.fixedScale?.targetLowPriorityNodes
        ).toEqual(5);
    });
});