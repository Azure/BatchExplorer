import { Model, Prop, Record } from "app/core";
import { JobHookTaskExecutionInfo } from "./job-hook-task-execution-info";

export interface JobHookTaskAttributes {
    poolId: string;
    nodeId: string;
    nodeUrl: string;
    jobPreparationTaskExecutionInfo: JobHookTaskExecutionInfo;
    jobReleaseTaskExecutionInfo: JobHookTaskExecutionInfo;
}

@Model()
export class JobHookTask extends Record<JobHookTaskAttributes> {
    @Prop() public poolId: string;
    @Prop() public nodeId: string;
    @Prop() public nodeUrl: string;
    @Prop() public jobPreparationTaskExecutionInfo: JobHookTaskExecutionInfo;
    @Prop() public jobReleaseTaskExecutionInfo: JobHookTaskExecutionInfo;
}
