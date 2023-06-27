/**
 * Statistics about an executed job
 */
import { Model, Prop, Record } from "@batch-flask/core";
import { Duration } from "luxon";

export interface JobStatisticsAttributes {
    kernelCPUTime: Duration;
    lastUpdateTime: Date;
    numFailedTasks: string;
    numSucceededTasks: string;
    numTaskRetries: string;
    readIOGiB: number;
    readIOps: number;
    startTime: Date;
    url: string;
    userCPUTime: Duration;
    waitTime: Duration;
    wallClockTime: Duration;
    writeIOGiB: number;
    writeIOps: number;
}

@Model()
export class JobStatistics extends Record<JobStatisticsAttributes> {
    @Prop() public kernelCPUTime: Duration;
    @Prop() public lastUpdateTime: Date;
    @Prop() public numFailedTasks: number = 0;
    @Prop() public numSucceededTasks: number = 0;
    @Prop() public numTaskRetries: number = 0;
    @Prop() public readIOGiB: number;
    @Prop() public readIOps: number;
    @Prop() public startTime: Date;
    @Prop() public url: string;
    @Prop() public userCPUTime: Duration;
    @Prop() public waitTime: Duration;
    @Prop() public wallClockTime: Duration;
    @Prop() public writeIOGiB: number;
    @Prop() public writeIOps: number;

    constructor(data: any) {
        super({
            ...data,
            numFailedTasks: parseInt(data.numFailedTasks, 10),
            numSucceededTasks: parseInt(data.numSucceededTasks, 10),
            numTaskRetries: parseInt(data.numTaskRetries, 10),
        });
    }
}
