import { BatchServiceClient, BatchServiceModels } from "azure-batch";

import { ListProxy, mapGet, wrapOptions } from "./shared";

export class JobScheduleProxy {

    constructor(private client: BatchServiceClient) {
    }

    /**
     * Adds a job schedule to the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#add
     * @param jobSchedule: The job schedule object
     * @param options: Optional Parameters.
     */
    public add(jobSchedule: any, options?: any): Promise<any> {
        return this.client.jobSchedule.add(jobSchedule, wrapOptions(options));
    }

    /**
     * Deletes a job schedule from the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#deleteMethod
     * @param jobScheduleId: The ID of the job schedule to delete.
     * @param options: Optional Parameters.
     */
    public delete(jobScheduleId: string, options?: any): Promise<any> {
        return this.client.jobSchedule.deleteMethod(jobScheduleId, wrapOptions(options));
    }

    /**
     * No new jobs will be created until the job schedule is enabled again.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#disable
     * @param jobScheduleId: The ID of the job schedule to disable.
     * @param options: Optional Parameters.
     */
    public disable(jobScheduleId: string, options?: any): Promise<any> {
        return this.client.jobSchedule.disable(jobScheduleId, wrapOptions(options));
    }

    /**
     * Enables a job schedule.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#enable
     * @param jobScheduleId: The ID of the job schedule to enable.
     * @param options: Optional Parameters.
     */
    public enable(jobScheduleId: string, options?: any): Promise<any> {
        return this.client.jobSchedule.enable(jobScheduleId, wrapOptions(options));
    }

    /**
     * Gets information about the specified job schedule.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#get
     * @param jobScheduleId: The ID of the job schedule to get.
     * @param options: Optional Parameters.
     */
    public get(jobScheduleId: string, options?: BatchServiceModels.JobScheduleGetOptions): Promise<any> {
        return mapGet(this.client.jobSchedule.get(jobScheduleId, wrapOptions({ jobScheduleGetOptions: options })));
    }

    /**
     * Lists all of the job schedules in the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#list
     * @param options: Optional Parameters.
     */
    public list(options?: BatchServiceModels.JobScheduleListOptions) {
        return new ListProxy(this.client.jobSchedule, null, wrapOptions({ jobScheduleListOptions: options }));
    }

    /**
     * Updates the properties of the specified job schedule.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#terminate
     * @param jobScheduleId: The ID of the job schedule to terminates.
     * @param options: Optional Parameters.
     */
    public patch(jobScheduleId: string, attributes: any, options?: any): Promise<any> {
        return this.client.jobSchedule.patch(jobScheduleId, attributes, wrapOptions(options));
    }

    /**
     * Terminates a job schedule.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/JobSchedule.html#terminate
     * @param jobScheduleId: The ID of the job schedule to terminates.
     * @param options: Optional Parameters.
     */
    public terminate(jobScheduleId: string, options?: any): Promise<any> {
        return this.client.jobSchedule.terminate(jobScheduleId, wrapOptions(options));
    }
}
