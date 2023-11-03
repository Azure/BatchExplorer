import { OperationOptions } from "@azure/bonito-core";
import { BatchNodeVMExtensionOutput } from "@batch/batch-rest";

export interface NodeService {
    getVMExtension(
        poolId: string,
        nodeId: string,
        vmExtensionId: string,
        options?: OperationOptions
    ): Promise<BatchNodeVMExtensionOutput>;

    listVMExtensions(
        poolId: string,
        nodeId: string,
        options?: OperationOptions
    ): Promise<BatchNodeVMExtensionOutput[]>;
}
