import { Model, Prop, Record } from "@batch-flask/core";
import { TaskExecutionResult } from "./azure-batch";
import { FailureInfoAttributes } from "./failure-info";

export enum JobHookTaskState {
    Running = "running",
    Completed = "completed",
}

export interface JobHookTaskExecutionInfoAttributes {
    state: JobHookTaskState;
    startTime: Date;
    endTime: Date;
    taskRootDirectory: string;
    taskRootDirectoryUrl: string;
    exitCode: number;
    failureInfo: FailureInfoAttributes;
    retryCount: number;
    lastRetryTime: Date;
    result: TaskExecutionResult;
}

@Model()
export class JobHookTaskExecutionInfo extends Record<JobHookTaskExecutionInfoAttributes> {
    @Prop() public state: JobHookTaskState;
    @Prop() public startTime: Date;
    @Prop() public endTime: Date;
    @Prop() public taskRootDirectory: string;
    @Prop() public taskRootDirectoryUrl: string;
    @Prop() public exitCode: number;
    @Prop() public failureInfo: FailureInfoAttributes;
    @Prop() public retryCount: number;
    @Prop() public lastRetryTime: Date;
    @Prop() public result: TaskExecutionResult;
}
