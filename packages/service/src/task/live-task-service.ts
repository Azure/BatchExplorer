import {
    AbstractHttpService,
    CustomHttpHeaders,
    OperationOptions,
} from "@azure/bonito-core";
import { BatchTaskOutput } from "../batch-models";
import { createBatchClient, isUnexpected } from "../internal/batch-rest";
import { createBatchUnexpectedStatusCodeError } from "../utils";
import { TaskService } from "./task-service";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { paginate } from "../internal/arm-batch-rest";

export class LiveTaskService
    extends AbstractHttpService
    implements TaskService
{
    private _ensureHttpsEndpoint(accountEndpoint: string): string {
        if (!accountEndpoint.startsWith("https://")) {
            return `https://${accountEndpoint}`;
        }

        return accountEndpoint;
    }

    async listTasks(
        accountResourceId: string,
        jobId: string,
        opts?: OperationOptions
    ): Promise<PagedAsyncIterableIterator<BatchTaskOutput>> {
        const listTaskPath = "/jobs/{jobId}/tasks";
        const batchClient = createBatchClient(
            this._ensureHttpsEndpoint(accountResourceId)
        );

        const res = await batchClient.path(listTaskPath, jobId).get({
            headers: {
                [CustomHttpHeaders.CommandName]:
                    opts?.commandName ?? "ListTasks",
            },
        });
        if (isUnexpected(res)) {
            throw createBatchUnexpectedStatusCodeError(res);
        }

        return paginate(batchClient, res);
    }

    async getTask(
        accountResourceId: string,
        jobId: string,
        taskId: string,
        opts?: OperationOptions
    ): Promise<BatchTaskOutput | undefined> {
        const taskPath = "/jobs/{jobId}/tasks/{taskId}";
        const batchClient = createBatchClient(
            this._ensureHttpsEndpoint(accountResourceId)
        );
        const res = await batchClient.path(taskPath, jobId, taskId).get({
            headers: {
                [CustomHttpHeaders.CommandName]: opts?.commandName ?? "GetTask",
            },
        });

        if (isUnexpected(res)) {
            throw createBatchUnexpectedStatusCodeError(res);
        }

        return res.body;
    }
}
