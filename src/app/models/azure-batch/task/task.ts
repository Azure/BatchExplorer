import { List } from "immutable";
import * as moment from "moment";

import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import {
    ApplicationPackageReference, ApplicationPackageReferenceAttributes,
} from "app/models/application-package-reference";
import { ComputeNodeInformation } from "app/models/azure-batch/compute-node-information";
import { TaskContainerSettings } from "app/models/container-setup";
import { MultiInstanceSettings } from "app/models/multi-instance-settings";
import { NameValuePair, NameValuePairAttributes } from "app/models/name-value-pair";
import { ResourceFile, ResourceFileAttributes } from "app/models/resource-file";
import { TaskConstraints } from "app/models/task-constraints";
import { TaskDependencies } from "app/models/task-dependencies";
import { TaskExecutionInformation } from "app/models/task-execution-information";
import { TaskExitConditions } from "app/models/task-exit-conditions";
import { TaskOutputFile } from "app/models/task-output-file";
import { UserIdentity } from "app/models/user-identity";
import { AuthenticationTokenSettings, AuthenticationTokenSettingsAttributes } from "../authentication-token-settings";
import { AffinityInformation } from "./affinity-information";
import { TaskStatistics, TaskStatisticsAttributes } from "./task-statistics";

export interface TaskAttributes {
    id: string;
    jobId: string;
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
    resourceFiles: ResourceFileAttributes[];
    environmentSettings: NameValuePairAttributes[];
    affinityInfo: AffinityInformation;
    containerSettings: TaskContainerSettings;
    constraints: TaskConstraints;
    executionInfo: TaskExecutionInformation;
    nodeInfo: ComputeNodeInformation;
    multiInstanceSettings: MultiInstanceSettings;
    stats: TaskStatisticsAttributes;
    dependsOn: TaskDependencies;
    applicationPackageReferences: ApplicationPackageReferenceAttributes[];
    authenticationTokenSettings: AuthenticationTokenSettingsAttributes;
}
/**
 * Class for displaying Batch task information.
 */
@Model()
export class Task extends Record<TaskAttributes> {
    @Prop() public id: string;
    @Prop() public jobId: string;
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
    @Prop() public stats: TaskStatistics;
    @Prop() public dependsOn: TaskDependencies;
    @Prop() public authenticationTokenSettings: AuthenticationTokenSettings;

    @ListProp(ApplicationPackageReference)
    public applicationPackageReferences: List<ApplicationPackageReference> = List([]);

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

    public get runtime(): number | null {
        const info = this.executionInfo;
        if (!info || !info.endTime || !info.startTime) { return null; }
        return info.endTime.getTime() - info.startTime.getTime();
    }

    /**
     * Return if the task is being rescheduled because the prep task failed
     */
    public get preparationTaskFailed() {
        return this.state === TaskState.active && this.previousState === TaskState.preparing;
    }

    public get routerLink() {
        return ["/jobs", this.jobId, "tasks", this.id];
    }
}

export enum TaskState {
    active = "active",
    preparing = "preparing",
    running = "running",
    completed = "completed",
}
