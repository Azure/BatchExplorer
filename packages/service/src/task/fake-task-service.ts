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
                this.numOfTasks,
                this.generateTasks
            )
        );
    }
}

// add another memebr var numOfTasks, like line 8
// can use in listTasks() but not as parameter
// generate tasks or fake tasks
// function can change, signature has to be same
