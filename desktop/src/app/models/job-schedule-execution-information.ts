import { Model, Prop, Record } from "@batch-flask/core";
import { RecentJob, RecentJobAttributes } from "./recent-job";

export interface JobScheduleExecutionInformationAttributes {
    endTime: Date;
    nextRunTime: Date;
    recentJob: RecentJobAttributes;
}

/**
 * Contains information about the execution of a job schedule in the Azure
 */
@Model()
export class JobScheduleExecutionInformation extends Record<JobScheduleExecutionInformationAttributes> {
    @Prop() public endTime: Date;
    @Prop() public nextRunTime: Date;
    @Prop() public recentJob: RecentJob;
}
