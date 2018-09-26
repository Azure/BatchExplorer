import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { FailureInfoAttributes } from "./failure-info";
import { NameValuePair, NameValuePairAttributes } from "./name-value-pair";

/**
 * Job terminate reason.
 * Can be either of the value listen below or some string specified by the user.
 */
export enum JobTerminateReason {
    JMComplete = "JMComplete",
    MaxWallClockTimeExpiry = "MaxWallClockTimeExpiry",
    TerminateJobSchedule = "TerminateJobSchedule",
    AllTasksCompleted = "AllTasksCompleted",
    TaskFailed = "TaskFailed",
    /**
     * Default user terminated value
     */
    UserTerminate = "UserTerminate",
}

import { List } from "immutable";

export interface JobSchedulingErrorAttributes {
    code: string;
    category?: string;
    message?: string;
    details?: NameValuePairAttributes[];
}

/**
 * Job or task scheduling error.
 * Possible values are https://msdn.microsoft.com/en-us/library/azure/dn878162.aspx#BKMK_JobTaskError
 */
@Model()
export class JobSchedulingError extends Record<JobSchedulingErrorAttributes> {
    @Prop() public code: string;
    @Prop() public category: string;
    @Prop() public message: string;
    @ListProp(NameValuePair) public details: List<NameValuePair> = List([]);
}

export interface JobExecutionInformationAttributes {
    startTime: Date;
    endTime: Date;
    poolId: string;
    schedulingError: FailureInfoAttributes;
    terminateReason: JobTerminateReason;
}

/**
 * Contains information about the execution of a job in the Azure
 */
@Model()
export class JobExecutionInformation extends Record<JobExecutionInformationAttributes> {
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public poolId: string;
    @Prop() public schedulingError: JobSchedulingError;
    @Prop() public terminateReason: JobTerminateReason;
}
