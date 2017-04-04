import { BatchRequestOptions } from "./models";
import { DeleteProxy, GetProxy, ListProxy } from "./shared";

export default class JobProxy {
    private _getProxy: GetProxy;
    private _deleteProxy: DeleteProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.job);
        this._deleteProxy = new DeleteProxy(this.client.job);
    }

    /**
     * Lists all of the jobs in the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#list
     * @param options: Optional Parameters.
     */
    public list(options?: BatchRequestOptions) {
        return new ListProxy(this.client.job, null, { jobListOptions: options });
    }

    /**
     * Gets information about the specified job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#get
     * @param jobId: The id of the job.
     * @param options: Optional Parameters.
     */
    public get(jobId: string, options?: BatchRequestOptions) {
        return this._getProxy.execute([jobId], { jobGetOptions: options });
    }

    /**
     * Deletes a job.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#deleteMethod
     * @param jobId: The id of the job to terminate.
     * @param options: Optional Parameters.
     */
    public delete(jobId: string, options?: any) {
        return this._deleteProxy.execute([jobId], { jobDeleteMethodOptions: options });
    }

    /**
     * Terminates the specified job, marking it as completed.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#terminate
     * @param jobId: The id of the job to terminate.
     * @param options: Optional Parameters.
     */
    public terminate(jobId: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.terminate(jobId, { jobTerminateOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    /**
     * Disables the specified job, preventing new tasks from running.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#disable
     * @param jobId: The id of the job to disable.
     * @param disableTasks: What to do with active tasks associated with the job.
     *  Possible values include: 'requeue', 'terminate', 'wait'
     * @param options: Optional Parameters.
     */
    public disable(jobId: string, disableTasks: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.disable(jobId, disableTasks, { jobDisableOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    /**
     * Enables the specified job, allowing new tasks to run.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#enable
     * @param jobId: The id of the job to enable.
     * @param options: Optional Parameters.
     */
    public enable(jobId: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.enable(jobId, { jobEnableOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    /**
     * Adds a job to the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Job.html#add
     * @param job: The job object
     * @param options: Optional Parameters.
     */
    public add(job: any, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.add(job, { jobAddOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    public patch(jobId: string, attributes: any, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.patch(jobId, attributes, { }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}
