/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FetchHttpClient } from "@batch/ui-common";
import {
    BatchAccountListResultOutput,
    BatchManagementClient,
    CloudErrorOutput,
    ListPoolsResultOutput,
    Pool,
    PoolCreateParameters,
    PoolOutput,
    PoolUpdateParameters,
    isUnexpected,
} from "../generated";
import { BatchHttpClient } from "../http/HttpClient";
import { generateClient } from "./utils/client";
import {
    DependencyName,
    initMockEnvironment,
} from "@batch/ui-common/lib/environment";
import createClient from "../../src/generated/batchManagementClient";

const _SUFFIX = Math.random().toString(16).substr(2, 4);

function getPoolName(type: string) {
    return `jssdktest-${type}-${_SUFFIX}`;
}

const POOL_NAME = getPoolName("basic");
const VM_SIZE = "Standard_D1_v2";

describe("Batch Management Client With Custom Http Client Test", () => {
    let batchClient: BatchManagementClient;
    const subscriptionId = process.env.MABOM_BatchAccountSubscriptionId!;
    const resourceGroupName = process.env.MABOM_BatchAccountResourceGroupName!;
    const batchAccountName = process.env.MABOM_BatchAccountName!;

    beforeEach(() => {
        initMockEnvironment(
            {},
            { [DependencyName.HttpClient]: () => new FetchHttpClient() }
        );

        const clientOptions = {
            httpClient: new BatchHttpClient(),
        };

        batchClient = generateClient(clientOptions);
    });

    describe("Basic Pool operations", () => {
        test("Create Batch Pool", async () => {
            const pool: Pool = {
                properties: {
                    vmSize: VM_SIZE,
                    deploymentConfiguration: {
                        virtualMachineConfiguration: {
                            imageReference: {
                                publisher: "Canonical",
                                offer: "UbuntuServer",
                                sku: "18.04-LTS",
                                version: "latest",
                            },
                            nodeAgentSkuId: "batch.node.ubuntu 18.04",
                        },
                    },
                    scaleSettings: {
                        fixedScale: {
                            targetDedicatedNodes: 3,
                        },
                    },
                },
            };

            const callParams: PoolCreateParameters = {
                body: pool,
                headers: {},
            };

            const putResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName,
                    POOL_NAME
                )
                .put(callParams);

            if (putResult.status !== "200") {
                fail("Non-200 response from get pool");
            }

            const poolBody = putResult.body as PoolOutput;
            expect(poolBody.name).toEqual(POOL_NAME);
            expect(poolBody.properties?.vmSize?.toLowerCase()).toEqual(
                VM_SIZE.toLowerCase()
            );
            expect(
                poolBody.properties?.deploymentConfiguration
                    ?.virtualMachineConfiguration?.nodeAgentSkuId
            ).toEqual("batch.node.ubuntu 18.04");
        });

        test("Get pool", async () => {
            // const mockClient: MockHttpClient = new MockHttpClient(
            //     200,
            //     JSON.stringify({
            //         name: "linuxperfpool",
            //         properties: {
            //             allocationState: "steady",
            //             vmSize: "standard_d1_v2",
            //             currentDedicatedNodes: 4,
            //             currentLowPriorityNodes: 0,
            //             provisioningState: "Succeeded",
            //         },
            //     })
            // );

            const getResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName,
                    POOL_NAME
                )
                .get();

            if (getResult.status !== "200") {
                fail("Non-200 response from get pool");
            }

            const getResultBody = getResult.body as PoolOutput;
            expect(getResultBody.name).toEqual(POOL_NAME);
            expect(getResultBody.properties?.vmSize?.toLowerCase()).toEqual(
                VM_SIZE.toLowerCase()
            );
            expect(
                getResultBody.properties?.scaleSettings?.fixedScale
                    ?.targetDedicatedNodes
            ).toEqual(3);
        });

        test("Should list pools in the specified account with query OData parameters", async () => {
            const listResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName
                )
                .get({
                    queryParameters: {
                        maxresults: 1,
                        $select: "properties/vmSize,properties/displayName",
                        $filter: `name eq '${POOL_NAME}'`,
                    },
                });

            expect(listResult.status).toEqual("200");
            const bodyResult = listResult.body as ListPoolsResultOutput;
            expect(bodyResult.value?.length).toBe(1);
            const pool = bodyResult.value?.[0];
            expect(pool?.name).toBe(POOL_NAME);
            expect(pool?.properties?.vmSize?.toLowerCase()).toBe(
                VM_SIZE.toLowerCase()
            );
        });

        test("Should patch pool successfully", async () => {
            const updateParams: PoolUpdateParameters = {
                body: {
                    properties: {
                        metadata: [{ name: "foo", value: "bar" }],
                    },
                },
                headers: {},
            };

            const patchResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName,
                    POOL_NAME
                )
                .patch(updateParams);

            expect(patchResult.status).toEqual("200");

            const bodyResult = patchResult.body as PoolOutput;
            expect(bodyResult.properties?.metadata).toStrictEqual(
                updateParams.body.properties?.metadata
            );
        });

        test("Should fail to patch property and return error code", async () => {
            const updateParams: PoolUpdateParameters = {
                body: {
                    properties: {
                        vmSize: "Standard_D4",
                        metadata: [{ name: "foo", value: "bar" }],
                    },
                },
                headers: {},
            };

            const patchResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName,
                    POOL_NAME
                )
                .patch(updateParams);

            if (!isUnexpected(patchResult)) {
                fail("Response was expected success");
            }

            try {
                const errorOutput = patchResult.body as CloudErrorOutput;
                throw errorOutput.error;
            } catch (err: any) {
                expect(err?.message).toBeDefined();
                expect(err?.code).toBe("PropertyCannotBeUpdated");
            }
        });
    });

    describe("Batch Account Operations", () => {
        test("should get information about batch account associated with a resource group successfully", async () => {
            const listResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts",
                    subscriptionId,
                    resourceGroupName
                )
                .get();

            expect(listResult.status).toEqual("200");
            const bodyResult = listResult.body as BatchAccountListResultOutput;
            expect(bodyResult.value?.length).toBeGreaterThanOrEqual(1);
        });

        test("Testing non-authenticated management client", async () => {
            const testClient: BatchManagementClient = createClient(
                undefined as any
            );

            const listResult = await testClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts",
                    subscriptionId,
                    resourceGroupName
                )
                .get();

            //Expect Unauthorized status code
            expect(listResult.status).toEqual("401");
        });
    });

    describe("Resource", () => {
        test("Delete Batch Pool", async () => {
            const deleteResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName,
                    POOL_NAME
                )
                .delete();

            if (!deleteResult.status.startsWith("2")) {
                fail(
                    `Non-200 response from get pool, ${POOL_NAME} Pool is leaked`
                );
            }
        });
    });
});
