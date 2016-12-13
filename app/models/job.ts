import { Record } from "immutable";

import { JobStats } from "./";
import { AllTasksCompleteAction, JobAction, TaskFailureAction } from "./jobAction";
import { JobConstraints } from "./jobConstraints";
import { JobExecutionInformation } from "./jobExecutionInformation";
import { NameValuePair } from "./nameValuePair";

// tslint:disable:variable-name
const JobRecord = Record({
    id: null,
    displayName: null,
    usesTaskDependencies: false,
    url: null,
    eTag: null,
    lastModified: null,
    creationTime: null,
    state: null,
    stateTransitionTime: null,
    previousState: null,
    previousStateTransitionTime: null,
    priority: null,
    onAllTasksComplete: AllTasksCompleteAction.noaction,
    onTaskFailure: TaskFailureAction.noaction,
    constraints: null,
    jobManagerTask: null,
    jobPreparationTask: null,
    jobReleaseTask: null,
    commonEnvironmentSettings: null,
    poolInfo: null,
    metadata: null,
    executionInfo: null,
    stats: null,
});

/**
 * Class for displaying Batch job information.
 */
export class Job extends JobRecord {
    public id: string;
    public displayName: string;
    public usesTaskDependencies: boolean;
    public url: string;
    public eTag: string;
    public lastModified: Date;
    public creationTime: Date;
    public state: JobState;
    public stateTransitionTime: Date;
    public previousState: JobState;
    public previousStateTransitionTime: Date;
    public priority: number;
    public onAllTasksComplete: AllTasksCompleteAction;
    public onTaskFailure: TaskFailureAction;

    public constraints: JobConstraints;
    public jobManagerTask: any;
    public jobPreparationTask: any;
    public jobReleaseTask: any;
    public commonEnvironmentSettings: NameValuePair[];
    public poolInfo: any;
    public metadata: NameValuePair[];
    public executionInfo: JobExecutionInformation;
    public stats: JobStats;
}

export type JobState = "active" | "disabling" | "disabled" | "enabling" | "terminating" | "completed" | "deleting";
export const JobState = {
    active: "active" as JobState,
    disabling: "disabling" as JobState,
    disabled: "disabled" as JobState,
    enabling: "enabling" as JobState,
    terminating: "terminating" as JobState,
    completed: "completed" as JobState,
    deleting: "deleting" as JobState,
};
