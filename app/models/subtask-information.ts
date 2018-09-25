import { Model, Prop, Record } from "@batch-flask/core";
import { ComputeNodeInformation } from "./azure-batch/compute-node-information";
import { TaskState } from "./azure-batch/task";
import { TaskExecutionResult } from "./azure-batch/task-execution-result";
import { FailureInfo } from "./failure-info";
import {
    TaskContainerExecutionInfo, TaskContainerExecutionInfoAttributes,
} from "./task-container-execution-information";

export interface SubtaskInformationAttributes {
    id?: number;
    nodeInfo?: ComputeNodeInformation;
    startTime?: Date;
    endTime?: Date;
    exitCode?: number;
    failureInfo?: FailureInfo;
    state?: string;
    stateTransitionTime?: Date;
    previousState?: string;
    previousStateTransitionTime?: Date;
    result?: TaskExecutionResult;
    containerInfo?: TaskContainerExecutionInfoAttributes;
}

/**
 * Class for displaying MPI sub task information.
 */
@Model()
export class SubtaskInformation extends Record<SubtaskInformationAttributes> {
    @Prop() public id: string;
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public exitCode: number;
    @Prop() public state: TaskState;
    @Prop() public stateTransitionTime: Date;
    @Prop() public previousState: TaskState;
    @Prop() public previousStateTransitionTime: Date;

    @Prop() public nodeInfo: ComputeNodeInformation;
    @Prop() public failureInfo: FailureInfo;
    @Prop() public result: TaskExecutionResult;
    @Prop() public containerInfo: TaskContainerExecutionInfo;
}
