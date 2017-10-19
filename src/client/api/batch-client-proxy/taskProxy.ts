import { BatchServiceClient, BatchServiceModels } from "azure-batch-js";

import { BatchResult } from "./models";
import { ListProxy, mapGet, wrapOptions } from "./shared";

export  class TaskProxy {

    constructor(private client: BatchServiceClient) {
    }

    /**
     * Lists all of the tasks that are associated with the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#list
     * @param jobId: The id of the job.
     * @param options: Optional Parameters.
     */
    public list(jobId: string, options?: BatchServiceModels.TaskListOptions) {
        return new ListProxy(this.client.task, [jobId], wrapOptions({ taskListOptions: options }));
    }

    /**
     * Gets information about the specified task.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#get
     * @param jobId: The id of the job.
     * @param taskId: The id of the task.
     * @param options: Optional Parameters.
     */
    public get(jobId: string, taskId: string, options?: BatchServiceModels.TaskGetOptions): Promise<BatchResult> {
        return mapGet(this.client.task.get(jobId, taskId, wrapOptions({ taskGetOptions: options })));
    }

    /**
     * Lists all of the subtasks that are associated with the specified multi-instance task.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#get
     * @param jobId: The id of the job.
     * @param taskId: The id of the task.
     * @param options: Optional Parameters.
     */
    public listSubtasks(jobId: string, taskId: string, options?: BatchServiceModels.TaskListSubtasksOptions) {
        const entity = {
            list: this.client.task.listSubtasks.bind(this.client.task),
        };

        // returns all of the tasklets, there is no nextLink data
        return new ListProxy(entity, [jobId, taskId], wrapOptions({ taskListSubtasksOptions: options }));
    }

    /**
     * Deletes a task from the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#deleteMethod
     * @param jobId: The id of the job from which to delete the task.
     * @param taskId: The id of the task to delete.
     * @param options: Optional Parameters.
     */
    public delete(jobId: string, taskId: string, options?: any): Promise<any> {
        return this.client.task.deleteMethod(jobId, taskId, wrapOptions(options));
    }

    /**
     * Terminates the specified task, marking it as completed.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#terminate
     * @param jobId: The id of the job containing the task.
     * @param taskId: The id of the task to terminate.
     * @param options: Optional Parameters.
     */
    public terminate(jobId: string, taskId: string, options?: any): Promise<any> {
        return this.client.task.terminate(jobId, taskId, wrapOptions(options));
    }

    /**
     * Adds a task to the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#add
     * @param jobId: The id of the job to which the task is to be added.
     * @param task: The task to be added.
     * @param options: Optional Parameters.
     */
    public add(jobId: string, task: any, options?: any): Promise<any> {
        return this.client.task.add(jobId, task, wrapOptions(options));
    }

    public reactivate(jobId: string, task: any, options?: any): Promise<any> {
        return this.client.task.reactivate(jobId, task, wrapOptions(options));
    }
}
