import { BatchTaskOutput } from "../batch-models";
import { PagedAsyncIterableIterator } from "@azure/core-paging";

export interface TaskService {
    getTask(
        accountResourceId: string,
        jobId: string,
        taskId: string
    ): Promise<BatchTaskOutput | undefined>;

    listTasks(
        accountResourceId: string,
        jobId: string
    ): Promise<PagedAsyncIterableIterator<BatchTaskOutput>>;

    getTaskCounts(accountResourceId: string, jobId: string): Promise<any>;
}
