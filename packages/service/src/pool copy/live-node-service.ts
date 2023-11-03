import type { NodeService } from "./node-service";
import { AbstractHttpService, OperationOptions } from "@azure/bonito-core";
import {
    BatchNodeVMExtensionOutput,
    generateBatchClient,
} from "@batch/batch-rest";

export class LiveNodeService
    extends AbstractHttpService
    implements NodeService
{
    async getVMExtension(
        accountEndpoint: string,
        poolId: string,
        nodeId: string,
        vmExtensionId: string,
        options?: OperationOptions | undefined
    ): Promise<BatchNodeVMExtensionOutput> {
        const client = generateBatchClient(accountEndpoint);

        const res = await client
            .path(
                "/pools/{poolId}/nodes/{nodeId}/extensions/{extensionName}",
                poolId,
                nodeId,
                vmExtensionId
            )
            .get();

        if ("headers" in res) {
            return res.body;
        }
    }
    listVMExtensions(
        poolId: string,
        nodeId: string,
        options?: OperationOptions | undefined
    ): Promise<BatchNodeVMExtensionOutput[]> {
        throw new Error("Method not implemented.");
    }
}
