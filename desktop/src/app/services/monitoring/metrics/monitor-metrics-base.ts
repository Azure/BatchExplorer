import { HttpParams } from "@angular/common/http";
import { HttpRequestOptions } from "@batch-flask/core";
import { TimeRange } from "@batch-flask/ui";

/**
 * MonitorChartType defines the enumeration of the monitor chart type
 */
export enum MonitorChartType {
    CoreCount = "coreCount",
    FailedTask = "failedTask",
    NodeStates = "nodeStates",
    TaskStates = "taskStates",
}

/**
 * Metrics defines the enumeration of specific line data
 */
export enum MonitorChartMetrics {
    CoreCount = "CoreCount",
    LowPriorityCoreCount = "LowPriorityCoreCount",
    TaskStartEvent = "TaskStartEvent",
    TaskCompleteEvent = "TaskCompleteEvent",
    TaskFailEvent = "TaskFailEvent",
    StartingNodeCount = "StartingNodeCount",
    IdleNodeCount = "IdleNodeCount",
    RunningNodeCount = "RunningNodeCount",
    StartTaskFailedNodeCount = "StartTaskFailedNodeCount",
    RebootingNodeCount = "RebootingNodeCount",
}

/**
 * Aggregation defines the enumeration of request paramter values to monitor api
 */
export enum MonitorChartAggregation {
    Sum = "sum",
    Avg = "avg",
    Count = "count",
}

/**
 * MetricsParams defines the enumeration of request parameter names to monitor api
 */
export enum MonitorChartMetricsParams {
    Timespan = "timespan",
    Interval = "interval",
    Metric = "metric",
    Aggregation = "aggregation",
}

/**
 * MonitorChartColor defines the interface of chart color name value pair
 */
export interface MonitorChartColorPair {
    state: string;
    color: string;
}

const parameterDelimiter = ",";

export interface MonitoringMetric {
    name: string;
    label?: string;
}

export interface MonitoringMetricDefinitionAttributes {
    name: string;
    timespan: TimeRange;
    metrics: MonitoringMetric[];
}

export class MonitoringMetricDefinition implements MonitoringMetricDefinitionAttributes {
    public name: string;
    public timespan: TimeRange;
    public metrics: MonitoringMetric[];
    public interval: string;

    constructor(attrs: MonitoringMetricDefinitionAttributes) {
        Object.assign(this, attrs);
        this.interval = this._computeTimeInterval();
    }

    /**
     * Function that returns RequestOptions which are sent to armService
     */
    public getRequestOptions(): HttpRequestOptions {
        const params = new HttpParams()
            .set(MonitorChartMetricsParams.Timespan, this._timeSpanParam)
            .set(MonitorChartMetricsParams.Interval, this.interval)
            .set(MonitorChartMetricsParams.Metric, this._metricsParam)
            .set(MonitorChartMetricsParams.Aggregation, "average,total");
        return { params };
    }

    /**
     * Function that returns first half of the request url to Monitor api
     */
    public getRequestUrl(resourceId: string): string {
        return `${resourceId}/providers/Microsoft.Insights/metrics`;
    }

    /**
     * Get timespan parameter value which is used for constructing request url
     */
    private get _timeSpanParam(): string {
        return `${this.timespan.start.toISOString()}/${this.timespan.end.toISOString()}`;
    }

    /**
     * Get metric parameter value which is used for constructing request url
     */
    private get _metricsParam(): string {
        return `${this.metrics.map(x => x.name).join(parameterDelimiter)}`;
    }

    private _computeTimeInterval(): string {
        const duration = this.timespan.duration;
        const days = duration.as("days");
        const hours = duration.as("hours");
        if (days >= 30) {
            return "PT6H";
        } else if (days >= 7) {
            return "PT30M";
        } else if (hours >= 48) {
            return "PT15M";
        } else if (hours >= 12) {
            return "PT5M";
        } else {
            return "PT1M";
        }
    }

}
