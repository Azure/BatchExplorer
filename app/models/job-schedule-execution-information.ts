import { Model, Prop, Record } from "app/core";
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
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public recentJob: RecentJob;
}
