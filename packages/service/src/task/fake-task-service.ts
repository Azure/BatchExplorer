import { BatchFakeSet, BasicBatchFakeSet } from "../test-util/fakes";
import { BatchTaskOutput } from "../batch-models";
import type { TaskService } from "./task-service";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { createPagedArray } from "../test-util/paging-test-util";

export class FakeTaskService implements TaskService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();
    numOfTasks?: number;
    generateTasks?: boolean;

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
        jobId: string
    ): Promise<PagedAsyncIterableIterator<BatchTaskOutput>> {
        return createPagedArray(
            this.fakeSet.listTasks(
                accountEndpoint,
                jobId,
                this.generateTasks,
                this.numOfTasks
            )
        );
    }

    async getTaskCounts(accountEndpoint: string, jobId: string): Promise<any> {
        return this.fakeSet.getTaskCounts(accountEndpoint, jobId);
    }
}
