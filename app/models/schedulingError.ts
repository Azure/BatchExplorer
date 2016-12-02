
/**
 * An error encountered by the Batch service when scheduling a job.
 */
export class SchedulingError {
    public category: string;
    public code: string;
    public message: string;
    public details: any;
}
