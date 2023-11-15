import { AbstractHttpService, OperationOptions } from "@azure/bonito-core";
import { BatchNodeOutput, BatchNodeVMExtensionOutput } from "./node-models";
import { NodeService } from "./node-service";
import { createBatchClient, isUnexpected } from "../internal/batch-rest";
import { createUnexpectedStatusCodeError } from "../utils";

export class LiveNodeService
    extends AbstractHttpService
    implements NodeService
{
    async listBatchNodes(
        accountEndpoint: string,
        poolId: string,
        opts?: OperationOptions | undefined
    ): Promise<BatchNodeOutput[] | undefined> {
        const listNodePath = "/pools/{poolId}/nodes";
        const batchClient = createBatchClient(accountEndpoint);
        const res = await batchClient.path(listNodePath, poolId).get();

        if (isUnexpected(res)) {
            throw createUnexpectedStatusCodeError(res);
        }

        return res.body.value;
    }

    async listBatchNodeExtensions(
        accountEndpoint: string,
        poolId: string,
        nodeId: string,
        opts?: OperationOptions | undefined
    ): Promise<BatchNodeVMExtensionOutput[] | undefined> {
        const listNodeExtensionPath =
            "/pools/{poolId}/nodes/{nodeId}/extensions";
        const batchClient = createBatchClient(accountEndpoint);
        const res = await batchClient
            .path(listNodeExtensionPath, poolId, nodeId)
            .get();

        if (isUnexpected(res)) {
            throw createUnexpectedStatusCodeError(res);
        }

        return res.body.value;
    }
}
