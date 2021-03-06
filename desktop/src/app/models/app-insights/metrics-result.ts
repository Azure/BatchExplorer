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
    // CPU
    cpuUsage?: NodesPerformanceMetric;
    individualCpuUsage?: StringMap<PerformanceMetric[]>;

    // Memory
    memoryAvailable?: NodesPerformanceMetric;
    memoryUsed?: NodesPerformanceMetric;

    // Network
    networkRead?: NodesPerformanceMetric;
    networkWrite?: NodesPerformanceMetric;

    // Disk IO
    diskRead?: NodesPerformanceMetric;
    diskWrite?: NodesPerformanceMetric;

    // Disk usage
    diskUsed?: NodesDisksPerformanceMetric;
    diskFree?: NodesDisksPerformanceMetric;

    // GPU
    gpuUsage?: NodesPerformanceMetric;
    individualGpuUsage?: StringMap<PerformanceMetric[]>;

    // GPU memory
    gpuMemory?: NodesPerformanceMetric;
    individualGpuMemory?: StringMap<PerformanceMetric[]>;
}

export type BatchPerformanceMetricType = keyof BatchPerformanceMetrics;
