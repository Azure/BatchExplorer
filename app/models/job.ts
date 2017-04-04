import { List, Record } from "immutable";

import { ModelUtils } from "app/utils";
import { AllTasksCompleteAction, TaskFailureAction } from "./job-action";
import { JobConstraints } from "./job-constraints";
import { JobExecutionInformation } from "./job-execution-information";
import { JobManagerTask } from "./job-manager-task";
import { JobPreparationTask } from "./job-preparation-task";
import { JobReleaseTask } from "./job-release-task";
import { JobStats } from "./job-stats";
import { Metadata } from "./metadata";
import { NameValuePair } from "./name-value-pair";

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
    metadata: List([]),
    executionInfo: null,
    stats: null,
    schedulingError: null,
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
    public jobManagerTask: JobManagerTask;
    public jobPreparationTask: JobPreparationTask;
    public jobReleaseTask: JobReleaseTask;
    public commonEnvironmentSettings: NameValuePair[];
    public poolInfo: any;
    public metadata: List<Metadata>;
    public executionInfo: JobExecutionInformation;
    public stats: JobStats;

    /**
     * Tags are computed from the metadata using an internal key
     */
    public tags: List<string> = List([]);

    constructor(data: any = {}) {
        super(Object.assign({}, data, {
            jobPreparationTask: data.jobPreparationTask && new JobPreparationTask(data.jobPreparationTask),
            jobReleaseTask: data.jobReleaseTask && new JobReleaseTask(data.jobReleaseTask),
            jobManagerTask: data.jobManagerTask && new JobManagerTask(data.jobManagerTask),
            executionInfo: data.executionInfo && new JobExecutionInformation(data.executionInfo),
            metadata: List(data.metadata && data.metadata.map(x => new Metadata(x))),
        }));
        this.tags = ModelUtils.tagsFromMetadata(this.metadata);
    }

    /**
     * Return the pool used by this job.
     */
    public get poolId() {
        return this.executionInfo && this.executionInfo.poolId;
    }
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
