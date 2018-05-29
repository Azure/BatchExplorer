import { Model, Prop, Record } from "@batch-flask/core";
import * as moment from "moment";
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
    result?: string;
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

    public get runningTime() {
        return moment.duration(moment(this.endTime).diff(this.startTime));
    }
}
