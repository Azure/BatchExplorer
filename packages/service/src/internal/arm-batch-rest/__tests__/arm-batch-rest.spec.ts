/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createARMBatchClient } from "../client";
import {
    BatchAccountListResultOutput,
    BatchManagementClient,
    CloudErrorBodyOutput,
    CloudErrorOutput,
    ListPoolsResultOutput,
    Pool,
    PoolCreateParameters,
    PoolOutput,
    PoolUpdateParameters,
} from "../generated";
import {
    BATCH_API_VERSION,
    getUrlBatchAccountPath,
    getUrlPoolPath,
} from "../__tests__/utils/client";
import {
    DependencyName,
    getMockEnvironment,
    initMockEnvironment,
} from "@azure/bonito-core/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@azure/bonito-core/lib/http";

const _SUFFIX = Math.random().toString(16).substr(2, 4);

function getPoolName(type: string) {
    return `jssdktest-${type}-${_SUFFIX}`;
}

const POOL_NAME = getPoolName("basic");
const VM_SIZE = "Standard_D1_v2";
const nodeAgentSkuId = "batch.node.ubuntu 18.04";
const poolSpecs: Pool = {
    name: POOL_NAME,
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
                nodeAgentSkuId: nodeAgentSkuId,
            },
        },
        scaleSettings: {
            fixedScale: {
                targetDedicatedNodes: 3,
            },
        },
    },
};
let mockClient: MockHttpClient;
const subscriptionId = "00000000-0000-0000-0000-000000000000";
const resourceGroupName = "fake_resource_group";
const batchAccountName = "fake_batch_account";

describe("Batch Management Client With Mock Http Client Test", () => {
    let batchClient: BatchManagementClient;

    beforeEach(() => {
        initMockEnvironment();
        mockClient = getMockEnvironment().getInjectable(
            DependencyName.HttpClient
        );

        batchClient = createARMBatchClient();
    });

    describe("Basic Pool operations", () => {
        const requestUrlPoolPath = getUrlPoolPath(
            subscriptionId,
            resourceGroupName,
            batchAccountName,
            POOL_NAME
        );

        test("Create Batch Pool", async () => {
            const callParams: PoolCreateParameters = {
                body: poolSpecs,
                headers: {},
            };

            mockClient.addExpected(
                new MockHttpResponse(requestUrlPoolPath, {
                    status: 200,
                    body: JSON.stringify(<PoolOutput>{
                        name: POOL_NAME,
                        properties: poolSpecs.properties,
                    }),
                }),
                {
                    method: "PUT",
                    body: JSON.stringify(callParams.body),
                }
            );

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
            expect(poolBody.name).toBe(POOL_NAME);
            expect(poolBody.properties?.vmSize?.toLowerCase()).toEqual(
                VM_SIZE.toLowerCase()
            );
            expect(
                poolBody.properties?.deploymentConfiguration
                    ?.virtualMachineConfiguration?.nodeAgentSkuId
            ).toEqual(nodeAgentSkuId);
        });

        test("Get pool", async () => {
            mockClient.addExpected(
                new MockHttpResponse(requestUrlPoolPath, {
                    status: 200,
                    body: JSON.stringify(<PoolOutput>{
                        name: POOL_NAME,
                        properties: poolSpecs.properties,
                    }),
                }),
                {
                    method: "GET",
                }
            );

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
            const requestUrlPath = getUrlPoolPath(
                subscriptionId,
                resourceGroupName,
                batchAccountName
            );

            mockClient.addExpected(
                new MockHttpResponse(requestUrlPath, {
                    status: 200,
                    body: JSON.stringify(<ListPoolsResultOutput>{
                        value: [
                            {
                                id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Batch/batchAccounts/${batchAccountName}/pools/{POOL_NAME}`,
                                name: POOL_NAME,
                                type: "Microsoft.Batch/batchAccounts/pools",
                                properties: poolSpecs.properties,
                            },
                        ],
                    }),
                }),
                {
                    method: "GET",
                }
            );

            const listResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName
                )
                .get();

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

            mockClient.addExpected(
                new MockHttpResponse(requestUrlPoolPath, {
                    status: 200,
                    body: JSON.stringify(<PoolOutput>{
                        name: POOL_NAME,
                        properties: updateParams.body.properties,
                    }),
                }),
                {
                    method: "PATCH",
                    body: JSON.stringify(updateParams.body),
                }
            );

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

            mockClient.addExpected(
                new MockHttpResponse(requestUrlPoolPath, {
                    status: undefined,
                    body: JSON.stringify({
                        error: <CloudErrorBodyOutput>{
                            code: "PropertyCannotBeUpdated",
                            message: "Error sending request",
                            name: "Error",
                        },
                    }),
                }),
                {
                    method: "PATCH",
                    body: JSON.stringify(updateParams.body),
                }
            );

            const patchResult = await batchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName,
                    POOL_NAME
                )
                .patch(updateParams);

            const errorOutput = patchResult.body as CloudErrorOutput;
            expect(errorOutput?.error?.message).toBeDefined();
            expect(errorOutput?.error?.code).toBe("PropertyCannotBeUpdated");
        });

        test("Delete Batch Pool", async () => {
            mockClient.addExpected(
                new MockHttpResponse(requestUrlPoolPath, {
                    status: 200,
                }),
                {
                    method: "DELETE",
                }
            );

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

    describe("Batch Account Operations", () => {
        test("should get information about batch account associated with a resource group successfully", async () => {
            const requestUrlPath =
                getUrlBatchAccountPath(subscriptionId, resourceGroupName) +
                `?api-version=${BATCH_API_VERSION}`;

            mockClient.addExpected(
                new MockHttpResponse(requestUrlPath, {
                    status: 200,
                    body: JSON.stringify(<BatchAccountListResultOutput>{
                        value: [
                            {
                                id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Batch/batchAccounts/${batchAccountName}`,
                            },
                        ],
                    }),
                })
            );

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
    });
});
