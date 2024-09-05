import { Model, Record, Prop } from "@batch-flask/core/record";

export interface JobTaskSlotCountsAttributes {
    active?: number;
    running?: number;
    completed?: number;
    succeeded?: number;
    failed?: number;
}

@Model()
export class JobTaskSlotCounts extends Record<JobTaskSlotCountsAttributes> {
    @Prop() public active: number = 0;
    @Prop() public running: number = 0;
    @Prop() public completed: number = 0;
    @Prop() public succeeded: number = 0;
    @Prop() public failed: number = 0;

    public total: number;

    constructor(data: JobTaskSlotCountsAttributes = {}) {
        super(data);
        this.total = this.active + this.running + this.completed;
    }
}
