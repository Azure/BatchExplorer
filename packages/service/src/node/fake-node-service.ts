import { OperationOptions } from "@azure/bonito-core";
import { BatchFakeSet, BasicBatchFakeSet } from "../test-util/fakes";
import { BatchNodeOutput, BatchNodeVMExtensionOutput } from "./node-models";
import type { ListNodesOptions, NodeService } from "./node-service";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { createPagedArray } from "../test-util/paging-test-util";

export class FakeNodeService implements NodeService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async getNode(
        accountEndpoint: string,
        poolName: string,
        nodeId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeOutput> {
        return this.fakeSet.getNode(accountEndpoint, poolName, nodeId);
    }

    async listNodes(
        accountEndpoint: string,
        poolName: string,
        opts?: ListNodesOptions
    ): Promise<PagedAsyncIterableIterator<BatchNodeOutput>> {
        return createPagedArray(
            this.fakeSet.listNodes(accountEndpoint, poolName)
        );
    }

    async listVmExtensions(
        accountEndpoint: string,
        poolName: string,
        nodeId: string,
        opts?: OperationOptions
    ): Promise<BatchNodeVMExtensionOutput[]> {
        return this.fakeSet.listVmExtensions(nodeId);
    }
}
