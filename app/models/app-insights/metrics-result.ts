export type AppInsightsMetricsResult = AppInsightsMetricResult[];
export interface AppInsightsMetricResult {
    id: string;
    status: string;
    body: {
        value: AppInsightsMetricBody;
    };
}

export interface AppInsightsMetricBody {
    start: string;
    end: string;
    interval: string;
    segments: AppInsightsMetricSegment[];
}

export interface AppInsightsMetricSegment {
    start: string;
    end: string;
    [key: string]: any;
}

export interface PerformanceMetric {
    time: Date;
    value: number;
}

/**
 * Value of a metric separated by node. Map key are node ids.
 */
export type NodesPerformanceMetric = StringMap<PerformanceMetric[]>;

export interface BatchPerformanceMetrics {
    cpuUsage: PerformanceMetric[];
    individualCpuUsage: PerformanceMetric[][];
    memory: NodesPerformanceMetric;
    networkRead: PerformanceMetric[];
    networkWrite: PerformanceMetric[];
    diskRead: PerformanceMetric[];
    diskWrite: PerformanceMetric[];
    diskUsed: PerformanceMetric[];
    diskFree: PerformanceMetric[];
}

export enum BatchPerformanceMetricType {
    cpuUsage = "cpuUsage",
    individualCpuUsage = "individualCpuUsage",
    memoryAvailable = "memoryAvailable",
    memoryUsed = "memoryUsed",
    diskRead = "diskRead",
    diskWrite = "diskWrite",
    networkRead = "networkRead",
    networkWrite = "networkWrite",
    diskUsed = "diskUsed",
    diskFree = "diskFree",
}
