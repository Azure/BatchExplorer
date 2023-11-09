import { OperationOptions } from "@azure/bonito-core";
import { BatchNodeOutput, BatchNodeVMExtensionOutput } from "./node-models";

export interface NodeService {
    listBatchNodes(
        accountEndpoint: string,
        poolId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeOutput[] | undefined>;

    listBatchNodeExtensions(
        accountEndpoint: string,
        poolId: string,
        nodeId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeVMExtensionOutput[] | undefined>;
}
