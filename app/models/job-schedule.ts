import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { ModelUtils } from "app/utils";
import { Job } from "./job";
import {
    JobScheduleExecutionInformation, JobScheduleExecutionInformationAttributes,
} from "./job-schedule-execution-information";
import { JobScheduleStats } from "./job-schedule-stats";
import { Metadata, MetadataAttributes } from "./metadata";
import { NavigableRecord } from "./navigable-record";
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
    jobSpecification: Job;
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
    @Prop() public jobSpecification: any;
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
}

export enum JobScheduleState {
    active = "active",
    disabled = "disabled",
    terminating = "terminating",
    completed = "completed",
    deleting = "deleting",
}
