import { Injectable } from "@angular/core";
import { FilterBuilder } from "@batch-flask/core";
import {
    AppInsightsMetricSegment, AppInsightsMetricsResult, BatchPerformanceMetricType, BatchPerformanceMetrics,
} from "app/models/app-insights/metrics-result";
import { Observable } from "rxjs";
import { AppInsightsApiService } from "./app-insights-api.service";

interface Metric {
    metricId: string;
    segment?: string;
}

const metrics: StringMap<Metric> = {
    cpuUsage: { metricId: "customMetrics/Cpu usage" },
    individualCpuUsage: { metricId: "customMetrics/Cpu usage", segment: "customDimensions/[Cpu #]" },
    memoryAvailable: { metricId: "customMetrics/Memory available", segment: "cloud/roleInstance" },
    memoryUsed: { metricId: "customMetrics/Memory used", segment: "cloud/roleInstance" },
    diskRead: { metricId: "customMetrics/Disk read" },
    diskWrite: { metricId: "customMetrics/Disk write" },
    diskUsed: { metricId: "customMetrics/Disk usage", segment: "customDimensions/Disk" },
    diskFree: { metricId: "customMetrics/Disk free", segment: "customDimensions/Disk" },
    networkRead: { metricId: "customMetrics/Network read" },
    networkWrite: { metricId: "customMetrics/Network write" },
};
@Injectable()
export class AppInsightsQueryService {
    constructor(private appInsightsApi: AppInsightsApiService) { }

    /**
     * Run the given query and return the result
     * @param query
     */
    public query(appId: string, query: string) {
        return this.appInsightsApi.get(`apps/${appId}/query`, {
            params: { query },
        });
    }

    /**
     * Run the given metrics query and return the result
     * @param query
     */
    public metrics(appId: string, query: any) {
        return this.appInsightsApi.post(`apps/${appId}/metrics`, query);
    }

    public getPoolPerformance(appId: string, poolId: string, lastNMinutes: number):
        Observable<BatchPerformanceMetrics> {
        return this.metrics(appId, this._buildQuery(poolId, null, lastNMinutes)).map((data) => {
            return this._processMetrics(data.json());
        });
    }

    public getNodePerformance(appId: string, poolId: string, nodeId: string, lastNMinutes: number):
        Observable<BatchPerformanceMetrics> {
        return this.metrics(appId, this._buildQuery(poolId, nodeId, lastNMinutes)).map((data) => {
            return this._processMetrics(data.json());
        });
    }

    private _buildQuery(poolId: string, nodeId: string, timespanInMinutes: number) {
        const timespan = `PT${timespanInMinutes}M`;
        const interval = this._computeInterval(timespanInMinutes);
        return Object.keys(metrics).map((id) => {
            const metric = metrics[id];
            return {
                id: id,
                parameters: {
                    aggregation: "avg",
                    metricId: metric.metricId,
                    filter: this._buildFilter(poolId, nodeId).toOData(),
                    interval,
                    timespan,
                    segment: metric.segment,
                },
            };
        });
    }

    private _computeInterval(timespan: number) {
        const numberOfPoints = 1000;
        const intervalInSeconds = Math.ceil(timespan / numberOfPoints * 60 / 10) * 10;
        return `PT${intervalInSeconds}S`;
    }

    private _buildFilter(poolId: string, nodeId?: string) {
        const poolFilter = FilterBuilder.prop("cloud/roleName").eq(poolId);
        if (nodeId) {
            const nodeFilter = FilterBuilder.prop("cloud/roleInstance").eq(nodeId);
            return FilterBuilder.and(poolFilter, nodeFilter);
        } else {
            return poolFilter;
        }
    }
    private _processMetrics(data: AppInsightsMetricsResult): BatchPerformanceMetrics {
        const performances = {};
        for (const metricResult of data) {
            const id = metricResult.id;
            const segments = metricResult.body.value.segments;
            switch (id) {
                case BatchPerformanceMetricType.individualCpuUsage:
                    performances[id] = this._processIndividualCpuUsage(segments);
                    break;
                case BatchPerformanceMetricType.diskFree:
                case BatchPerformanceMetricType.diskUsed:
                    performances[id] = this._processDiskUsage(id, segments);
                    break;
                case BatchPerformanceMetricType.memoryAvailable:
                case BatchPerformanceMetricType.memoryUsed:
                    performances[id] = this._processMetricToSum(id, segments);
                    break;
                default:
                    performances[id] = this._processSimpleMetric(id, segments);
            }
        }
        return performances as BatchPerformanceMetrics;
    }

    private _processSimpleMetric(metricId: string, segments: AppInsightsMetricSegment[]) {
        return segments.map((segment) => {
            const time = this._getDateAvg(new Date(segment.start), new Date(segment.end));
            const value = segment[this._getMetricId(metricId)].avg;
            return {
                time,
                value,
            };
        });
    }

    private _processIndividualCpuUsage(segments) {
        let usages: any[] = null;
        for (const segment of segments) {
            const time = this._getDateAvg(new Date(segment.start), new Date(segment.end));
            const individualSegments = segment.segments;
            if (usages === null) {
                usages = individualSegments.map(() => []);
            }
            for (let i = 0; i < individualSegments.length; i++) {
                const individualSegment = individualSegments[i];
                const value = individualSegment[this._getMetricId("individualCpuUsage")].avg;
                usages[i].push({
                    time,
                    value,
                });
            }
        }
        return usages;
    }

    private _processDiskUsage(id: string, segments: any[]) {
        const metricId = this._getMetricId(id);
        const usages: any = {};
        for (const segment of segments) {
            const time = this._getDateAvg(new Date(segment.start), new Date(segment.end));

            for (const individualSegment of segment.segments) {
                const disk = individualSegment["customDimensions/Disk"];
                const value = individualSegment[metricId].avg;
                if (!(disk in usages)) {
                    usages[disk] = [];
                }
                usages[disk].push({
                    time,
                    value,
                });
            }
        }
        return usages;
    }

    private _processMetricToSum(metricId: string, segments: AppInsightsMetricSegment[]) {
        const usages = [];
        for (const segment of segments) {
            const time = this._getDateAvg(new Date(segment.start), new Date(segment.end));
            const individualSegments = segment.segments;
            let sum = 0;
            for (const individualSegment of individualSegments) {
                const value = individualSegment[this._getMetricId(metricId)].avg;
                sum += value;
            }

            usages.push({
                time,
                value: sum,
            });
        }
        return usages;
    }

    private _getDateAvg(start: Date, end: Date): Date {
        return new Date((end.getTime() + start.getTime()) / 2);
    }

    private _getMetricId(id: string) {
        return metrics[id].metricId;
    }
}
