import { Model, Prop, Record } from "@batch-flask/core";
import { TaskState } from "./azure-batch/task";
import { TaskExecutionResult } from "./azure-batch/task-execution-result";
import { FailureInfo, FailureInfoAttributes } from "./failure-info";
import { TaskContainerExecutionInfo } from "./task-container-execution-information";

export interface StartTaskInfoAttributes {
    state: TaskState;
    startTime?: Date;
    endTime?: Date;
    exitCode: number;
    failureInfo?: FailureInfoAttributes;
    retryCount: number;
    result: TaskExecutionResult;
}

/**
 * Class for displaying Start Task execution info from a node.
 */
@Model()
export class StartTaskInfo extends Record<StartTaskInfoAttributes> {
    @Prop() public state: TaskState;
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public lastRetryTime: Date;
    @Prop() public exitCode: number;
    @Prop() public failureInfo: FailureInfo;
    @Prop() public retryCount: number;
    @Prop() public result: TaskExecutionResult;
    @Prop() public containerInfo: TaskContainerExecutionInfo;
}
