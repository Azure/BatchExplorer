import { Model, Prop, Record } from "@batch-flask/core";
import { JobTaskCounts } from "./job-task-counts";
import { JobTaskSlotCounts } from "./job-task-slot-counts";

export interface JobTaskCountsResultAttributes {
    taskCounts: JobTaskCounts;
    taskSlotCounts: JobTaskSlotCounts;
}

@Model()
export class JobTaskCountsResult extends Record<JobTaskCountsResultAttributes> {
    @Prop() public taskCounts: JobTaskCounts;
    @Prop() public taskSlotCounts: JobTaskSlotCounts;
}
