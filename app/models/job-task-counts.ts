import { Model, Prop, Record } from "@batch-flask/core";

export enum JobTaskCountsValidationStatus {
    validated = "Validated",
    unvalidated = "Unvalidated",
}

export interface JobTaskCountsAttributes {
    active?: number;
    running?: number;
    completed?: number;
    succeeded?: number;
    failed?: number;
    validationStatus?: JobTaskCountsValidationStatus;
}

@Model()
export class JobTaskCounts extends Record<JobTaskCountsAttributes> {
    @Prop() public active: number = 0;
    @Prop() public running: number = 0;
    @Prop() public completed: number = 0;
    @Prop() public succeeded: number = 0;
    @Prop() public failed: number = 0;
    @Prop() public validationStatus: JobTaskCountsValidationStatus = JobTaskCountsValidationStatus.validated;

    public total: number;

    constructor(data: JobTaskCountsAttributes = {}) {
        super(data);
        this.total = this.active + this.running + this.completed;
    }
}
