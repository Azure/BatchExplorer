import { BatchRequestOptions } from "./models";
import { ActionProxy, DeleteProxy, GetProxy, ListProxy } from "./shared";

export default class TaskProxy {
    private _getProxy: GetProxy;
    private _deleteProxy: DeleteProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.task);
        this._deleteProxy = new DeleteProxy(this.client.task);
    }

    /**
     * Lists all of the tasks that are associated with the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#list
     * @param jobId: The id of the job.
     * @param options: Optional Parameters.
     */
    public list(jobId: string, options?: BatchRequestOptions) {
        return new ListProxy(this.client.task, [jobId], { taskListOptions: options });
    }

    /**
     * Gets information about the specified task.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#get
     * @param jobId: The id of the job.
     * @param taskId: The id of the task.
     * @param options: Optional Parameters.
     */
    public get(jobId: string, taskId: string, options?: BatchRequestOptions) {
        return this._getProxy.execute([jobId, taskId], { taskGetOptions: options });
    }

    /**
     * Lists all of the subtasks that are associated with the specified multi-instance task.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#get
     * @param jobId: The id of the job.
     * @param taskId: The id of the task.
     * @param options: Optional Parameters.
     */
    public listSubtasks(jobId: string, taskId: string, options?: BatchRequestOptions) {
        const entity = {
            list: this.client.task.listSubtasks.bind(this.client.task),
        };

        // returns all of the tasklets, there is no nextLink data
        return new ListProxy(entity, [jobId, taskId], { taskListSubtasksOptions: options });
    }

    /**
     * Deletes a task from the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#deleteMethod
     * @param jobId: The id of the job from which to delete the task.
     * @param taskId: The id of the task to delete.
     * @param options: Optional Parameters.
     */
    public delete(jobId: string, taskId: string, options?: any) {
        return this._deleteProxy.execute([jobId, taskId], { taskDeleteMethodOptions: options });
    }

    /**
     * Terminates the specified task, marking it as completed.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#terminate
     * @param jobId: The id of the job containing the task.
     * @param taskId: The id of the task to terminate.
     * @param options: Optional Parameters.
     */
    public terminate(jobId: string, taskId: string, options?: any) {
        const entity = {
            action: this.client.task.terminate.bind(this.client.task),
        };

        return new ActionProxy(entity).execute([jobId, taskId], { taskTerminateOptions: options });
    }

    /**
     * Adds a task to the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Task.html#add
     * @param jobId: The id of the job to which the task is to be added.
     * @param task: The task to be added.
     * @param options: Optional Parameters.
     */
    public add(jobId: string, task: any, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.task.add(jobId, task, { taskAddOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}
