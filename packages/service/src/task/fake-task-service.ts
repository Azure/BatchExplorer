import { BatchFakeSet, BasicBatchFakeSet } from "../test-util/fakes";
import { BatchTaskOutput } from "../batch-models";
import type { TaskService } from "./task-service";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { createPagedArray } from "../test-util/paging-test-util";

export class FakeTaskService implements TaskService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async getTask(
        accountEndpoint: string,
        jobId: string,
        taskId: string
    ): Promise<BatchTaskOutput> {
        return this.fakeSet.getTask(accountEndpoint, jobId, taskId);
    }

    async listTasks(
        accountEndpoint: string,
        jobId: string,
        numOfTasks?: number
    ): Promise<PagedAsyncIterableIterator<BatchTaskOutput>> {
        return createPagedArray(
            this.fakeSet.listTasks(accountEndpoint, jobId, numOfTasks)
        );
    }
}
