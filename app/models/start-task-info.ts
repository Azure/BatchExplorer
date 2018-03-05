import { Model, Prop, Record } from "@batch-flask/core";
import { FailureInfo, FailureInfoAttributes } from "./failure-info";
import { TaskState } from "./task";

export interface StartTaskInfoAttributes {
    state: TaskState;
    startTime?: Date;
    endTime?: Date;
    exitCode: number;
    failureInfo?: FailureInfoAttributes;
    retryCount: number;
}

/**
 * Class for displaying Start Task execution info from a node.
 */
@Model()
export class StartTaskInfo extends Record<StartTaskInfoAttributes> {
    @Prop() public state: TaskState;
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public exitCode: number;
    @Prop() public failureInfo: FailureInfo;
    @Prop() public retryCount: number;
}
