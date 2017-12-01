import { List } from "immutable";
import * as moment from "moment";

import { ListProp, Model, Prop, Record } from "app/core";
import { AffinityInformation } from "./affinity-information";
import { ApplicationPackageReference } from "./application-package-reference";
import { ComputeNodeInformation } from "./compute-node-information";
import { MultiInstanceSettings } from "./multi-instance-settings";
import { NameValuePair } from "./name-value-pair";
import { ResourceFile } from "./resource-file";
import { TaskConstraints } from "./task-constraints";
import { TaskContainerSettings } from "./task-container-settings";
import { TaskDependencies } from "./task-dependencies";
import { TaskExecutionInformation } from "./task-execution-information";
import { TaskExitConditions } from "./task-exit-conditions";
import { TaskOutputFile } from "./task-output-file";
import { UserIdentity } from "./user-identity";

export interface TaskAttributes {
    id: string;
    displayName: string;
    url: string;
    eTag: string;
    lastModified: Date;
    creationTime: Date;
    state: TaskState;
    stateTransitionTime: Date;
    previousState: TaskState;
    previousStateTransitionTime: Date;
    commandLine: string;
    runElevated: boolean;
    exitConditions: TaskExitConditions;
    resourceFiles: ResourceFile[];
    environmentSettings: NameValuePair[];
    affinityInfo: AffinityInformation;
    containerSettings: TaskContainerSettings;
    constraints: TaskConstraints;
    executionInfo: TaskExecutionInformation;
    nodeInfo: ComputeNodeInformation;
    multiInstanceSettings: MultiInstanceSettings;
    stats: any; // TaskStatistics
    dependsOn: TaskDependencies;
    applicationPackageReferences: ApplicationPackageReference[];
}
/**
 * Class for displaying Batch task information.
 */
@Model()
export class Task extends Record<TaskAttributes> {
    @Prop() public id: string;
    @Prop() public displayName: string;
    @Prop() public url: string;
    @Prop() public eTag: string;
    @Prop() public lastModified: Date;
    @Prop() public creationTime: Date;
    @Prop() public state: TaskState;
    @Prop() public stateTransitionTime: Date;
    @Prop() public previousState: TaskState;
    @Prop() public previousStateTransitionTime: Date;
    @Prop() public commandLine: string;
    @Prop() public userIdentity: UserIdentity;
    @Prop() public exitConditions: TaskExitConditions = new TaskExitConditions();
    @ListProp(ResourceFile) public resourceFiles: List<ResourceFile> = List([]);
    @ListProp(TaskOutputFile) public outputFiles: List<TaskOutputFile> = List([]);
    @ListProp(NameValuePair) public environmentSettings: List<NameValuePair> = List([]);
    @Prop() public affinityInfo: AffinityInformation;
    @Prop() public containerSettings: TaskContainerSettings;
    @Prop() public constraints: TaskConstraints;
    @Prop() public executionInfo: TaskExecutionInformation;
    @Prop() public nodeInfo: ComputeNodeInformation;
    @Prop() public multiInstanceSettings: MultiInstanceSettings;
    @Prop() public stats: any; // TaskStatistics
    @Prop() public dependsOn: TaskDependencies;
    @Prop() public applicationPackageReferences: ApplicationPackageReference[];

    /**
     * @returns true if the task timeout.
     * To happen the task must have maxWallClockTime set
     */
    public get didTimeout() {
        const info = this.executionInfo;
        const constraints = this.constraints;
        if (!(info && info.failureInfo && info.exitCode && constraints && constraints.maxWallClockTime)) {
            return false;
        }
        if (info.exitCode === 0) {
            return false;
        }
        const maxTime = constraints.maxWallClockTime.asMilliseconds();
        const runningTime = moment(info.endTime).diff(moment(info.startTime));
        return maxTime - runningTime < 0;
    }

    /**
     * Return if the task is being rescheduled because the prep task failed
     */
    public get preparationTaskFailed() {
        return this.state === TaskState.active && this.previousState === TaskState.preparing;
    }
}

export enum TaskState {
    active = "active",
    preparing = "preparing",
    running = "running",
    completed = "completed",
}
