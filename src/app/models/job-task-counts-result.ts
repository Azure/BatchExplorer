import { Model, Prop, Record } from "@batch-flask/core";
import { JobTaskCounts, JobTaskCountsAttributes } from "./job-task-counts";
import { JobTaskSlotCounts, JobTaskSlotCountsAttributes } from "./job-task-slot-counts";

export interface JobTaskCountsResultAttributes {
    taskCounts: JobTaskCountsAttributes;
    taskSlotCounts: JobTaskSlotCountsAttributes;
}

@Model()
export class JobTaskCountsResult extends Record<JobTaskCountsResultAttributes> {
    @Prop() public taskCounts: JobTaskCounts;
    @Prop() public taskSlotCounts: JobTaskSlotCounts;
}
