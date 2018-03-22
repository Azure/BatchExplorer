import { BatchServiceClient, BatchServiceModels } from "azure-batch";

import { JobDisableParameter } from "azure-batch/typings/lib/models";
import { ListProxy, mapGet, wrapOptions } from "./shared";

export class JobProxy {

    constructor(private client: BatchServiceClient) {
    }

    /**
     * Lists all of the jobs in the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#list
     * @param options: Optional Parameters.
     */
    public list(options?: BatchServiceModels.JobListOptions) {
        return new ListProxy(this.client.job, null, wrapOptions({ jobListOptions: options }));
    }

    /**
     * Gets information about the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#get
     * @param jobId: The id of the job.
     * @param options: Optional Parameters.
     */
    public get(jobId: string, options?: BatchServiceModels.JobGetOptions): Promise<any> {
        return mapGet(this.client.job.get(jobId, wrapOptions({ jobGetOptions: options })));
    }

    /**
     * Deletes a job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#deleteMethod
     * @param jobId: The id of the job to terminate.
     * @param options: Optional Parameters.
     */
    public delete(jobId: string, options?: any): Promise<any> {
        return this.client.job.deleteMethod(jobId, wrapOptions(options));
    }

    /**
     * Terminates the specified job, marking it as completed.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#terminate
     * @param jobId: The id of the job to terminate.
     * @param options: Optional Parameters.
     */
    public terminate(jobId: string, options?: any): Promise<any> {
        return this.client.job.terminate(jobId, wrapOptions(options));
    }

    /**
     * Disables the specified job, preventing new tasks from running.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#disable
     * @param jobId: The id of the job to disable.
     * @param disableTasks: What to do with active tasks associated with the job.
     *  Possible values include: 'requeue', 'terminate', 'wait'
     * @param options: Optional Parameters.
     */
    public disable(jobId: string, disableTasks: JobDisableParameter, options?: any): Promise<any> {
        return this.client.job.disable(jobId, disableTasks, wrapOptions(options));
    }

    /**
     * Enables the specified job, allowing new tasks to run.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#enable
     * @param jobId: The id of the job to enable.
     * @param options: Optional Parameters.
     */
    public enable(jobId: string, options?: any): Promise<any> {
        return this.client.job.enable(jobId, wrapOptions(options));
    }

    /**
     * Adds a job to the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#add
     * @param job: The job object
     * @param options: Optional Parameters.
     */
    public add(job: any, options?: any): Promise<any> {
        return this.client.job.add(job, wrapOptions(options));
    }

    public patch(jobId: string, attributes: any, options?: any): Promise<any> {
        return this.client.job.patch(jobId, attributes, wrapOptions(options));
    }

    public getTaskCounts(jobId: string): Promise<any> {
        return this.client.job.getTaskCounts(jobId, wrapOptions({}));
    }

    /**
     */
    public listHookTasks(
        jobId: string,
        options?: BatchServiceModels.JobListPreparationAndReleaseTaskStatusNextOptions) {

        const entity = {
            list: this.client.job.listPreparationAndReleaseTaskStatus.bind(this.client.job),
            listNext: this.client.job.listPreparationAndReleaseTaskStatusNext.bind(this.client.job),
        };

        // returns all of the tasklets, there is no nextLink data
        return new ListProxy(entity, [jobId],
            wrapOptions({ jobListPreparationAndReleaseTaskStatusOptions: options }));
    }
}
