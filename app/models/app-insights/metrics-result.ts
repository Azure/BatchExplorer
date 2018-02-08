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

export interface BatchPerformanceMetrics {
    cpuUsage: PerformanceMetric[];
    individualCpuUsage: PerformanceMetric[][];
    memory: PerformanceMetric[];
    networkRead: PerformanceMetric[];
    networkWrite: PerformanceMetric[];
    diskRead: PerformanceMetric[];
    diskWrite: PerformanceMetric[];
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
}
