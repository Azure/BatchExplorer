import { Model, Prop, Record } from "@batch-flask/core";
import { Duration } from "luxon";

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
    @Prop() public userCPUTime: Duration;
    @Prop() public kernelCPUTime: Duration;
    @Prop() public wallClockTime: Duration;
    @Prop() public waitTime: Duration;
    @Prop() public readIOps: number;
    @Prop() public writeIOps: number;
    @Prop() public readIOGiB: number;
    @Prop() public writeIOGiB: number;
}
