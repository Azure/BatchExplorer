import { OperationOptions } from "@azure/bonito-core";
import { BatchNodeOutput, BatchNodeVMExtensionOutput } from "./node-models";
import { PagedAsyncIterableIterator } from "@azure/core-paging";

export interface ListNodesOptions extends OperationOptions {
    filter: string;
}

export interface NodeService {
    getNode(
        accountEndpoint: string,
        poolName: string,
        nodeId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeOutput>;

    listNodes(
        accountEndpoint: string,
        poolName: string,
        opts?: ListNodesOptions
    ): Promise<PagedAsyncIterableIterator<BatchNodeOutput>>;

    listVmExtensions(
        accountEndpoint: string,
        poolName: string,
        nodeId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeVMExtensionOutput[]>;
}
