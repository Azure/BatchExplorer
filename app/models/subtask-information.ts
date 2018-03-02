import { Model, Prop, Record } from "@batch-flask/core";

import { ComputeNodeInformation } from "./compute-node-information";
import { FailureInfo } from "./failure-info";
import { TaskState } from "./task";

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
    result?: string;
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
}
