import { RequestOptions, URLSearchParams } from "@angular/http";
import * as moment from "moment";

/**
 * TimeFrame defines the enumeration for monitor chart timeframe picker
 */
export enum MonitorChartTimeFrame {
    Hour = "1h",
    Day = "1d",
    Week = "1w",
    Month = "1M",
}

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
    Total = "Total",
    Average = "Average",
    Count = "Count",
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

/**
 * Timespan and interval constants used for rendering the charts
 */
const hourTimeSpan = moment.duration({ hours: 1 });
const dayTimeSpan = moment.duration({ days: 1 });
const weekTimeSpan = moment.duration({ weeks: 1 });
const monthTimeSpan = moment.duration({ month: 1 });
const minInterval = moment.duration({ minutes: 1 });
const quarterHourInterval = moment.duration({ minutes: 15 });
const oneHoursInterval = moment.duration({ hours: 1 });
const parameterDelimiter = ",";

export interface MonitoringMetric {
    name: string;
    aggregation: MonitorChartAggregation;
    label?: string;
}

export interface MonitoringMetricDefinitionAttributes {
    name: string;
    timespan: MonitorChartTimeFrame;
    metrics: MonitoringMetric[];
}

export class MonitoringMetricDefinition implements MonitoringMetricDefinitionAttributes {
    public name: string;
    public timespan: MonitorChartTimeFrame;
    public metrics: MonitoringMetric[];
    public interval: moment.Duration;
    private _timeSpanEnd: string;
    private _timeSpanStart: string;

    constructor(attrs: MonitoringMetricDefinitionAttributes) {
        Object.assign(this, attrs);
        this._computeTimeInterval();
        this._computeTimeSpan();
    }

    /**
     * Function that returns RequestOptions which are sent to armService
     */
    public getRequestOptions(): RequestOptions {
        const search = new URLSearchParams();
        search.set(MonitorChartMetricsParams.Timespan, this._timeSpanParam);
        search.set(MonitorChartMetricsParams.Interval, this._intervalParam);
        search.set(MonitorChartMetricsParams.Metric, this._metricsParam);
        search.set(MonitorChartMetricsParams.Aggregation, this._aggregationParam);
        return new RequestOptions({ search });
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
        return `${this._timeSpanStart}/${this._timeSpanEnd}`;
    }

    /**
     * Get interval parameter value which is used for constructing request url
     */
    private get _intervalParam(): string {
        return `${this.interval.toISOString()}`;
    }

    /**
     * Get metric parameter value which is used for constructing request url
     */
    private get _metricsParam(): string {
        return `${this.metrics.map(x => x.name).join(parameterDelimiter)}`;
    }

    /**
     * Get aggregation parameter value which is used for constructing request url
     */
    private get _aggregationParam(): string {
        return `${this.metrics.map(x => x.aggregation).join(parameterDelimiter)}`;
    }

    private _computeTimeInterval(): void {
        switch (this.timespan) {
            case MonitorChartTimeFrame.Hour:
                this.interval = minInterval;
                break;
            case MonitorChartTimeFrame.Day:
                this.interval = quarterHourInterval;
                break;
            case MonitorChartTimeFrame.Week:
                this.interval = oneHoursInterval;
                break;
            case MonitorChartTimeFrame.Month:
                this.interval = oneHoursInterval;
                break;
        }
    }

    /**
     * Set timespan start and end, these variables are used to construct request url
     * Timespan start and timespan end are two ISO format string
     */
    private _computeTimeSpan(): void {
        const timespan = moment();
        this._timeSpanEnd = timespan.toISOString();
        switch (this.timespan) {
            case MonitorChartTimeFrame.Hour:
                timespan.subtract(hourTimeSpan);
                break;
            case MonitorChartTimeFrame.Day:
                timespan.subtract(dayTimeSpan);
                break;
            case MonitorChartTimeFrame.Week:
                timespan.subtract(weekTimeSpan);
                break;
            case MonitorChartTimeFrame.Month:
                timespan.subtract(monthTimeSpan);
                break;
        }
        this._timeSpanStart = timespan.toISOString();
    }
}
