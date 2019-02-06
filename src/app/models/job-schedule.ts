import { List } from "immutable";

import { ListProp, Model, NavigableRecord, Prop, Record } from "@batch-flask/core";
import { ModelUtils } from "app/utils";
import { Job, JobAttributes } from "./azure-batch/job/job";
import {
    JobScheduleExecutionInformation, JobScheduleExecutionInformationAttributes,
} from "./job-schedule-execution-information";
import { JobScheduleStats } from "./job-schedule-stats";
import { Metadata, MetadataAttributes } from "./metadata";
import { Schedule } from "./schedule";

export interface JobScheduleAttributes {
    id: string;
    displayName: string;
    url: string;
    eTag: string;
    lastModified: Date;
    creationTime: Date;
    state: JobScheduleState;
    stateTransitionTime: Date;
    previousState: JobScheduleState;
    previousStateTransitionTime: Date;
    metadata: MetadataAttributes[];
    executionInfo: Partial<JobScheduleExecutionInformationAttributes>;
    stats: JobScheduleStats;
    jobSpecification: JobAttributes;
    schedule: Schedule;
}
/**
 * Class for displaying Batch job information.
 */
@Model()
export class JobSchedule extends Record<JobScheduleAttributes> implements NavigableRecord {
    @Prop() public id: string;
    @Prop() public displayName: string;
    @Prop() public url: string;
    @Prop() public eTag: string;
    @Prop() public lastModified: Date;
    @Prop() public creationTime: Date;
    @Prop() public state: JobScheduleState;
    @Prop() public stateTransitionTime: Date;
    @Prop() public previousState: JobScheduleState;
    @Prop() public previousStateTransitionTime: Date;
    @ListProp(Metadata) public metadata: List<Metadata> = List([]);
    @Prop() public executionInfo: JobScheduleExecutionInformation;
    @Prop() public stats: JobScheduleStats;
    @Prop() public jobSpecification: Job;
    @Prop() public schedule: Schedule;

    /**
     * Tags are computed from the metadata using an internal key
     */
    public readonly tags: List<string> = List([]);

    /**
     * If the job schedule properties can be edited on the server.
     * i.e. A competed job schedule cannot be edited anymore.
     */
    public readonly editable: boolean;

    constructor(data: Partial<JobScheduleAttributes> = {}) {
        super(data);
        this.tags = ModelUtils.tagsFromMetadata(this.metadata);
        this.editable = this.state !== JobScheduleState.completed;
    }

    public get routerLink(): string[] {
        return ["/jobschedules", this.id];
    }

    public get uid() {
        return this.url;
    }

    public get name() {
        return this.id;
    }
}

export enum JobScheduleState {
    active = "active",
    disabled = "disabled",
    terminating = "terminating",
    completed = "completed",
    deleting = "deleting",
}
