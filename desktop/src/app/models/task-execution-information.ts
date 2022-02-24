import { Model, Prop, Record } from "@batch-flask/core";
import { DateTime } from "luxon";
import { TaskExecutionResult } from "./azure-batch";
import { FailureInfo, FailureInfoAttributes } from "./failure-info";
import {
    TaskContainerExecutionInfo, TaskContainerExecutionInfoAttributes,
} from "./task-container-execution-information";

export interface TaskExecutionInformationAttributes {
    startTime: Date;
    endTime?: Date;
    state: string;
    taskRootDirectory?: string;
    taskRootDirectoryUrl?: string;
    exitCode?: number;
    failureInfo?: FailureInfoAttributes;
    retryCount: number;
    lastRetryTime?: Date;
    result?: TaskExecutionResult;
    containerInfo?: TaskContainerExecutionInfoAttributes;
}

/**
 * Contains information about the execution of a task in the Azure
 */
@Model()
export class TaskExecutionInformation extends Record<TaskExecutionInformationAttributes> {
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public exitCode: number;
    @Prop() public failureInfo: FailureInfo;
    @Prop() public retryCount: number;
    @Prop() public lastRetryTime: Date;
    @Prop() public requeueCount: number;
    @Prop() public lastRequeueTime: Date;
    @Prop() public containerInfo: TaskContainerExecutionInfo;
    @Prop() public result: TaskExecutionResult;

    public get runningTime() {
        return DateTime.fromJSDate(this.endTime).diff(DateTime.fromJSDate(this.startTime));
    }
}
