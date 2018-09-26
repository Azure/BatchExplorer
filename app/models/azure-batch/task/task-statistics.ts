import { Model, Prop, Record } from "@batch-flask/core";
import { Duration, duration } from "moment";

export interface TaskStatisticsAttributes {
    url: string;
    startTime: Date;
    lastUpdateTime: Date;
    userCPUTime: Duration;
    kernelCPUTime: Duration;
    wallClockTime: Duration;
    waitTime: Duration;
    readIOps: number;
    writeIOps: number;
    readIOGiB: number;
    writeIOGiB: number;
}

@Model()
export class TaskStatistics extends Record<TaskStatisticsAttributes> {
    @Prop() public url: string;
    @Prop() public startTime: Date;
    @Prop() public lastUpdateTime: Date;
    @Prop(duration) public userCPUTime: Duration;
    @Prop(duration) public kernelCPUTime: Duration;
    @Prop(duration) public wallClockTime: Duration;
    @Prop(duration) public waitTime: Duration;
    @Prop() public readIOps: number;
    @Prop() public writeIOps: number;
    @Prop() public readIOGiB: number;
    @Prop() public writeIOGiB: number;
}
