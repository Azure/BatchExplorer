import { OperationOptions } from "@azure/bonito-core";
import { BatchFakeSet, BasicBatchFakeSet } from "../test-util/fakes";
import { BatchNodeOutput, BatchNodeVMExtensionOutput } from "./node-models";
import type { NodeService } from "./node-service";

export class FakeNodeService implements NodeService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async listBatchNodes(
        accountEndpoint: string,
        poolId: string,
        opts?: OperationOptions | undefined
    ): Promise<BatchNodeOutput[] | undefined> {
        return this.fakeSet.listBatchNodes(poolId);
    }

    async listBatchNodeExtensions(
        accountEndpoint: string,
        poolId: string,
        nodeId: string,
        opts?: OperationOptions | undefined
    ): Promise<BatchNodeVMExtensionOutput[] | undefined> {
        return this.fakeSet.listBatchNodeExtensions(nodeId);
    }
}
