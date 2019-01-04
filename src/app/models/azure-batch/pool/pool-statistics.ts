import { Model, Prop, Record } from "@batch-flask/core";
import { Duration } from "luxon";

export interface ResourceStatisticsAttributes {
    avgCPUPercentage: number;
    avgDiskGiB: number;
    avgMemoryGiB: number;
    diskReadGiB: number;
    diskReadIOps: number;
    diskWriteGiB: number;
    diskWriteIOps: number;
    lastUpdateTime: Date;
    networkReadGiB: number;
    networkWriteGiB: number;
    peakDiskGiB: number;
    peakMemoryGiB: number;
    startTime: Date;
}

@Model()
export class ResourceStatistics extends Record<UsageStatisticsAttributes> {
    @Prop() public avgCPUPercentage: number;
    @Prop() public avgDiskGiB: number;
    @Prop() public avgMemoryGiB: number;
    @Prop() public diskReadGiB: number;
    @Prop() public diskReadIOps: number;
    @Prop() public diskWriteGiB: number;
    @Prop() public diskWriteIOps: number;
    @Prop() public lastUpdateTime: Date;
    @Prop() public networkReadGiB: number;
    @Prop() public networkWriteGiB: number;
    @Prop() public peakDiskGiB: number;
    @Prop() public peakMemoryGiB: number;
    @Prop() public startTime: Date;
}

export interface UsageStatisticsAttributes {
    dedicatedCoreTime: Duration;
    lastUpdateTime: Date;
    startTime: Date;
}

@Model()
export class UsageStatistics extends Record<UsageStatisticsAttributes> {
    @Prop() public dedicatedCoreTime: Duration;
    @Prop() public lastUpdateTime: Date;
    @Prop() public startTime: Date;
}

export interface PoolStatisticsAttributes {
    lastUpdateTime: Date;
    startTime: Date;
    url: string;
    resourceStats: ResourceStatisticsAttributes;
    usageState: UsageStatisticsAttributes;
}

@Model()
export class PoolStatistics extends Record<PoolStatisticsAttributes> {
    @Prop() public lastUpdateTime: Date;
    @Prop() public startTime: Date;
    @Prop() public url: string;
    @Prop() public resourceStats: ResourceStatistics;
    @Prop() public usageStats: UsageStatistics;
}
