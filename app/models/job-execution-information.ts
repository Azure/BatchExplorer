import { Record } from "immutable";

import { SchedulingError } from "./scheduling-error";

const JobExecutionInformationRecord = Record({
    startTime: null,
    endTime: null,
    poolId: null,
    schedulingError: null,
    terminateReason: null,
});

/**
 * Job terminate reason.
 * Can be either of the value listen below or some string specified by the user.
 */
export type JobTerminateReason = "JMComplete" | "MaxWallClockTimeExpiry"
    | "TerminateJobSchedule" | "AllTasksComplete" | "TaskFailed" | "UserTerminate" | string;

export const JobTerminateReason = {
    JMComplete: "JMComplete" as JobTerminateReason,
    MaxWallClockTimeExpiry: "MaxWallClockTimeExpiry" as JobTerminateReason,
    TerminateJobSchedule: "TerminateJobSchedule" as JobTerminateReason,
    AllTasksComplete: "AllTasksComplete" as JobTerminateReason,
    TaskFailed: "TaskFailed" as JobTerminateReason,
    /**
     * Default user terminated value
     */
    UserTerminate: "UserTerminate" as JobTerminateReason,
};

/**
 * Contains information about the execution of a job in the Azure
 */
export class JobExecutionInformation extends JobExecutionInformationRecord {
    public startTime: Date;
    public endTime: Date;
    public poolId: string;
    public schedulingError: SchedulingError;
    public terminateReason: JobTerminateReason;

    constructor(data: any) {
        super(Object.assign({}, data, {
            schedulingError: data.schedulingError && new SchedulingError(data.schedulingError),
        }));
    }
}
