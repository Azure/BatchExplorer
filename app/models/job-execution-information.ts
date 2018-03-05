import { Model, Prop, Record } from "@batch-flask/core";
import { FailureInfo, FailureInfoAttributes } from "./failure-info";

/**
 * Job terminate reason.
 * Can be either of the value listen below or some string specified by the user.
 */
export enum JobTerminateReason {
    JMComplete = "JMComplete",
    MaxWallClockTimeExpiry = "MaxWallClockTimeExpiry",
    TerminateJobSchedule = "TerminateJobSchedule",
    AllTasksComplete = "AllTasksComplete",
    TaskFailed = "TaskFailed",
    /**
     * Default user terminated value
     */
    UserTerminate = "UserTerminate",
}

export interface JobExecutionInformationAttributes {
    startTime: Date;
    endTime: Date;
    poolId: string;
    failureInfo: FailureInfoAttributes;
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
    @Prop() public failureInfo: FailureInfo;
    @Prop() public terminateReason: JobTerminateReason;
}
