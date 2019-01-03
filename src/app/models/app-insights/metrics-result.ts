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
    segments: AppInsightsMetricTimeSegment[];
}

export interface AppInsightsMetricSegment {
    segments?: AppInsightsMetricSegment[];
    [key: string]: any;
}

export interface AppInsightsMetricTimeSegment {
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
export type NodesDisksPerformanceMetric = StringMap<NodesPerformanceMetric>;
export type NodesCpusPerformanceMetric = StringMap<NodesPerformanceMetric>;

export interface BatchPerformanceMetrics {
    cpuUsage: NodesCpusPerformanceMetric;
    individualCpuUsage: PerformanceMetric[][];
    memory: NodesPerformanceMetric;
    networkRead: PerformanceMetric[];
    networkWrite: PerformanceMetric[];
    diskRead: PerformanceMetric[];
    diskWrite: PerformanceMetric[];
    diskUsed: NodesDisksPerformanceMetric;
    diskFree: NodesDisksPerformanceMetric;
}

export enum BatchPerformanceMetricType {
    cpuUsage = "cpuUsage",
    individualCpuUsage = "individualCpuUsage",
    gpuUsage = "gpuUsage",
    individualGpuUsage = "individualGpuUsage",
    gpuMemory = "gpuMemory",
    individualGpuMemory = "individualGpuMemory",
    memoryAvailable = "memoryAvailable",
    memoryUsed = "memoryUsed",
    diskRead = "diskRead",
    diskWrite = "diskWrite",
    networkRead = "networkRead",
    networkWrite = "networkWrite",
    diskUsed = "diskUsed",
    diskFree = "diskFree",
}
