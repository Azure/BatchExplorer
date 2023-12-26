/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createBatchClient } from "../client";
import {
    DependencyName,
    getMockEnvironment,
    initMockEnvironment,
} from "@azure/bonito-core/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@azure/bonito-core/lib/http";
import {
    BatchClient,
    BatchJobListResultOutput,
    BatchJobOutput,
    BatchNodeListResultOutput,
    BatchNodeVMExtensionListResultOutput,
    CreateJobParameters,
} from "../generated/src";

const batchAccountEndpoint = "https://batchaccount.eastus2.batch.azure.com";
const BATCH_API_VERSION = "2023-05-01.17.0";

describe("Batch Client With Mock Http Client Test", () => {
    let batchClient: BatchClient;
    let mockClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        mockClient = getMockEnvironment().getInjectable(
            DependencyName.HttpClient
        );

        batchClient = createBatchClient(batchAccountEndpoint);
    });

    describe("Basic Job operations", () => {
        test("Create Batch Job", async () => {
            const jobPath = "/jobs";
            const requestUrlJobPath = `${batchAccountEndpoint}${jobPath}?api-version=${BATCH_API_VERSION}`;
            const mockResponse = new MockHttpResponse(requestUrlJobPath, {
                status: 201,
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const jobParams: CreateJobParameters = {
                contentType: "application/json; odata=minimalmetadata",
                body: {
                    id: "test-job-id",
                    poolInfo: { poolId: "test-pool-id" },
                },
            };

            mockClient.addExpected(mockResponse, {
                method: "POST",
                body: JSON.stringify(jobParams.body),
            });

            const response = await batchClient.path("/jobs").post(jobParams);

            expect(response.status).toEqual("201");
        });

        test("Get Batch Job", async () => {
            const jobId = "test-job-id";
            const jobPath = "/jobs/{jobId}";
            const requestUrlJobPath = `${batchAccountEndpoint}${jobPath.replace(
                "{jobId}",
                jobId
            )}?api-version=${BATCH_API_VERSION}`;
            const mockResponse = new MockHttpResponse(requestUrlJobPath, {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(<BatchJobOutput>{
                    id: jobId,
                    poolInfo: { poolId: "test-pool-id" },
                }),
            });

            mockClient.addExpected(mockResponse, {
                method: "GET",
            });

            const response = await batchClient.path(jobPath, jobId).get();

            expect(response.status).toEqual("200");
            const body = response.body as BatchJobOutput;
            expect(body.id).toEqual(jobId);
            expect(body?.poolInfo.poolId).toEqual("test-pool-id");
        });

        test("list job", async () => {
            const jobPath = "/jobs";
            const requestUrlJobPath = `${batchAccountEndpoint}${jobPath}?api-version=${BATCH_API_VERSION}`;
            const mockResponse = new MockHttpResponse(requestUrlJobPath, {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(<BatchJobListResultOutput>{
                    value: [
                        {
                            id: "test-job-id",
                            poolInfo: { poolId: "test-pool-id" },
                        },
                    ],
                }),
            });

            mockClient.addExpected(mockResponse, {
                method: "GET",
            });

            const response = await batchClient.path(jobPath).get();

            expect(response.status).toEqual("200");
            const body = response.body as BatchJobListResultOutput;
            expect(body?.value?.length).toEqual(1);
            expect(body?.value?.[0].id).toEqual("test-job-id");
            expect(body?.value?.[0]?.poolInfo.poolId).toEqual("test-pool-id");
        });

        test("delete job", async () => {
            const jobId = "test-job-id";
            const jobPath = "/jobs/{jobId}";
            const requestUrlJobPath = `${batchAccountEndpoint}${jobPath.replace(
                "{jobId}",
                jobId
            )}?api-version=${BATCH_API_VERSION}`;
            const mockResponse = new MockHttpResponse(requestUrlJobPath, {
                status: 204,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            mockClient.addExpected(mockResponse, {
                method: "DELETE",
            });

            const response = await batchClient.path(jobPath, jobId).delete();

            expect(response.status).toEqual("204");
        });
    });
    describe("Basic Node operations", () => {
        test("list compute nodes", async () => {
            const poolId = "test-pool-id";
            const nodePath = "/pools/{poolId}/nodes";
            const requestUrlNodePath = `${batchAccountEndpoint}${nodePath.replace(
                "{poolId}",
                poolId
            )}?api-version=${BATCH_API_VERSION}`;
            const mockResponse = new MockHttpResponse(requestUrlNodePath, {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(<BatchNodeListResultOutput>{
                    value: [
                        {
                            id: "test-node-id",
                            state: "idle",
                        },
                    ],
                }),
            });

            mockClient.addExpected(mockResponse, {
                method: "GET",
            });

            const response = await batchClient.path(nodePath, poolId).get();

            expect(response.status).toEqual("200");
            const body = response.body as BatchNodeListResultOutput;
            expect(body?.value?.length).toEqual(1);
            expect(body?.value?.[0]?.id).toEqual("test-node-id");
            expect(body.value?.[0]?.state).toEqual("idle");
        });
    });

    test("list compute node extensions", async () => {
        const poolId = "test-pool-id";
        const nodeId = "test-node-id";
        const nodeExtensionPath = "/pools/{poolId}/nodes/{nodeId}/extensions";
        const requestUrlNodeExtensionPath = `${batchAccountEndpoint}${nodeExtensionPath
            .replace("{poolId}", poolId)
            .replace("{nodeId}", nodeId)}?api-version=${BATCH_API_VERSION}`;
        const mockResponse = new MockHttpResponse(requestUrlNodeExtensionPath, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(<BatchNodeVMExtensionListResultOutput>{
                value: [
                    {
                        vmExtension: {
                            name: "extension-name",
                            type: "extension-type",
                            publisher: "extension-publisher",
                            typeHandlerVersion: "1.0",
                        },
                        provisioningState: "success",
                    },
                ],
            }),
        });

        mockClient.addExpected(mockResponse, {
            method: "GET",
        });

        const response = await batchClient
            .path(nodeExtensionPath, poolId, nodeId)
            .get();

        expect(response.status).toEqual("200");
        const body = response.body as BatchNodeVMExtensionListResultOutput;
        expect(body?.value?.length).toEqual(1);
        expect(body?.value?.[0]?.vmExtension?.name).toEqual("extension-name");
        expect(body?.value?.[0]?.vmExtension?.type).toEqual("extension-type");
        expect(body?.value?.[0]?.vmExtension?.publisher).toEqual(
            "extension-publisher"
        );
        expect(body?.value?.[0]?.vmExtension?.typeHandlerVersion).toEqual(
            "1.0"
        );
        expect(body?.value?.[0]?.provisioningState).toEqual("success");
    });
});
