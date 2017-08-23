import { Model, Prop, Record } from "app/core";
import * as moment from "moment";
import { FailureInfo, FailureInfoAttributes } from "./failure-info";

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

    public get runningTime() {
        return moment.duration(moment(this.endTime).diff(this.startTime));
    }
}
