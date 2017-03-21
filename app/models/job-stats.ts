/**
 * Statistics about an executed job
 */
export class JobStats {
    public numSucceededTasks: number;
    public numFailedTasks: number;
    public numTaskRetries: number;
    public waitTime: Date;
}
