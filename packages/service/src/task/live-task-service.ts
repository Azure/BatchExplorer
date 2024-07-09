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
        accountEndpoint: string,
        jobId: string,
        opts?: OperationOptions
    ): Promise<PagedAsyncIterableIterator<BatchTaskOutput>> {
        const listTaskPath = "/jobs/{jobId}/tasks";
        const batchClient = createBatchClient(
            this._ensureHttpsEndpoint(accountEndpoint)
        );

        console.log(
            "service was called, entering try:",
            accountEndpoint,
            jobId
        );
        console.log("creating task interface");

        const createTaskI = batchClient.path(listTaskPath, jobId);

        console.log(createTaskI);

        let res = null;

        try {
            res = await createTaskI.get({
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "ListTasks",
                },
            });
        } catch (e: any) {
            console.log(e);
        }

        res = await createTaskI.get({
            headers: {
                [CustomHttpHeaders.CommandName]:
                    opts?.commandName ?? "ListTasks",
            },
        });

        console.log("service worked:", res);

        if (isUnexpected(res)) {
            console.log("unexpected res: ", res);
            throw createBatchUnexpectedStatusCodeError(res);
        }

        return paginate(batchClient, res);
    }

    async getTask(
        accountEndpoint: string,
        jobId: string,
        taskId: string,
        opts?: OperationOptions
    ): Promise<BatchTaskOutput | undefined> {
        const taskPath = "/jobs/{jobId}/tasks/{taskId}";
        const batchClient = createBatchClient(
            this._ensureHttpsEndpoint(accountEndpoint)
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
