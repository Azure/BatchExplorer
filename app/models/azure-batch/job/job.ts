import { List } from "immutable";

import { ListProp, Model, NavigableRecord, Prop, Record } from "@batch-flask/core";
import { ModelUtils } from "app/utils";
import { AllTasksCompleteAction, TaskFailureAction } from "../../job-action";
import { JobConstraints } from "../../job-constraints";
import { JobExecutionInformation, JobExecutionInformationAttributes } from "../../job-execution-information";
import { JobManagerTask } from "../../job-manager-task";
import { JobPreparationTask } from "../../job-preparation-task";
import { JobReleaseTask } from "../../job-release-task";
import { JobStatistics, JobStatisticsAttributes } from "../../job-stats";
import { Metadata, MetadataAttributes } from "../../metadata";
import { NameValuePair, NameValuePairAttributes } from "../../name-value-pair";
import { PoolInformation, PoolInformationAttributes } from "./pool-information";

export interface JobAttributes {
    id: string;
    displayName: string;
    usesTaskDependencies: boolean;
    url: string;
    eTag: string;
    lastModified: Date;
    creationTime: Date;
    state: JobState;
    stateTransitionTime: Date;
    previousState: JobState;
    previousStateTransitionTime: Date;
    priority: number;
    onAllTasksComplete: AllTasksCompleteAction;
    onTaskFailure: TaskFailureAction;

    constraints: Partial<JobConstraints>;
    jobManagerTask: Partial<JobManagerTask>;
    jobPreparationTask: Partial<JobPreparationTask>;
    jobReleaseTask: Partial<JobReleaseTask>;
    commonEnvironmentSettings: NameValuePairAttributes[];
    poolInfo: PoolInformationAttributes;
    metadata: MetadataAttributes[];
    executionInfo: Partial<JobExecutionInformationAttributes>;
    stats: JobStatisticsAttributes;
}
/**
 * Class for displaying Batch job information.
 */
@Model()
export class Job extends Record<JobAttributes> implements NavigableRecord {
    @Prop() public id: string;
    @Prop() public displayName: string;
    @Prop() public usesTaskDependencies: boolean;
    @Prop() public url: string;
    @Prop() public eTag: string;
    @Prop() public lastModified: Date;
    @Prop() public creationTime: Date;
    @Prop() public state: JobState;
    @Prop() public stateTransitionTime: Date;
    @Prop() public previousState: JobState;
    @Prop() public previousStateTransitionTime: Date;
    @Prop() public priority: number;
    @Prop() public onAllTasksComplete: AllTasksCompleteAction = AllTasksCompleteAction.noaction;
    @Prop() public onTaskFailure: TaskFailureAction = TaskFailureAction.noaction;

    @Prop() public constraints: JobConstraints;
    @Prop() public jobManagerTask: JobManagerTask;
    @Prop() public jobPreparationTask: JobPreparationTask;
    @Prop() public jobReleaseTask: JobReleaseTask;
    @ListProp(NameValuePair) public commonEnvironmentSettings: List<NameValuePair> = List([]);
    @Prop() public poolInfo: PoolInformation;
    @ListProp(Metadata) public metadata: List<Metadata> = List([]);
    @Prop() public executionInfo: JobExecutionInformation;
    @Prop() public stats: JobStatistics;

    /**
     * Tags are computed from the metadata using an internal key
     */
    public readonly tags: List<string> = List([]);

    /**
     * If the job properties can be edited on the server.
     * i.e. A competed job cannot be edited anymore.
     */
    public readonly editable: boolean;

    constructor(data: Partial<JobAttributes> = {}) {
        super(data);
        this.tags = ModelUtils.tagsFromMetadata(this.metadata);
        this.editable = this.state !== JobState.completed;
    }

    /**
     * Return the pool used by this job.
     */
    public get poolId() {
        return this.executionInfo && this.executionInfo.poolId;
    }

    public get routerLink(): string[] {
        return ["/jobs", this.id];
    }
}

export enum JobState {
    active = "active",
    disabling = "disabling",
    disabled = "disabled",
    enabling = "enabling",
    terminating = "terminating",
    completed = "completed",
    deleting = "deleting",
}
