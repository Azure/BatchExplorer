import { OperationOptions } from "@azure/bonito-core";
import { BatchTaskCountsResultOutput, BatchTaskOutput } from "../batch-models";
import { PagedAsyncIterableIterator } from "@azure/core-paging";

export interface TaskService {
    getTask(
        accountEndpoint: string,
        jobId: string,
        taskId: string,
        opts?: OperationOptions
    ): Promise<BatchTaskOutput | undefined>;

    listTasks(
        accountEndpoint: string,
        jobId: string,
        opts?: OperationOptions
    ): Promise<PagedAsyncIterableIterator<BatchTaskOutput>>;

    getTaskCounts(
        accountEndpoint: string,
        jobId: string,
        opts?: OperationOptions
    ): Promise<BatchTaskCountsResultOutput | undefined>;
}
