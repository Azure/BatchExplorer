import { Model, Prop, Record } from "app/core";
import { FailureInfoAttributes } from "./failure-info";

export type JobHookTaskState = "running" | "completed";
export const JobHookTaskState = {
    running: "running" as JobHookTaskState,
    completed: "completed" as JobHookTaskState,
};

export type JobHookTaskResult = "success" | "failure";
export const JobHookTaskResult = {
    success: "success" as JobHookTaskResult,
    failure: "failure" as JobHookTaskResult,
};

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
    result: JobHookTaskResult;
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
    @Prop() public result: JobHookTaskResult;

    constructor(data: any) {
        super(data);
        console.log("Exit code", data.exitCode, this.exitCode);
    }
}
