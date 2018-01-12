import { RequestOptions, URLSearchParams } from "@angular/http";
import * as moment from "moment";

export enum Metrics {
    CoreCount = "CoreCount",
    TaskStartEvent = "TaskStartEvent",
    TaskCompleteEvent = "TaskCompleteEvent",
    TaskFailEvent = "TaskFailEvent",
    StartingNodeCount = "StartingNodeCount",
    IdleNodeCount = "IdleNodeCount",
    RunningNodeCount = "RunningNodeCount",
    StartTaskFailedNodeCount = "StartTaskFailedNodeCount",
    RebootingNodeCount = "RebootingNodeCount",
}

export enum Aggregation {
    Total = "Total",
}

export enum MetricsParams {
    Timespan = "timespan",
    Interval = "interval",
    Metric = "metric",
    Aggregation = "aggregation",
}

const defaultTimeSpan = moment.duration({ hours: 1 });
const defaultInterval = moment.duration({ minutes: 1 });
const parameterDelimiter = ",";

export interface MonitorMetrics {
    metrics: Metrics[];
    aggregation: Aggregation[];
    interval: moment.Duration;
    getRequestUrl(resourceId: string): string;
    getRequestOptions(): RequestOptions;
}

export class MonitorMetricsBase implements MonitorMetrics {
    public metrics: Metrics[];
    public aggregation: Aggregation[];
    public interval: moment.Duration;

    // Set internally
    private _timeSpanStart: string;
    private _timeSpanEnd: string;
    constructor(metrics: Metrics[], aggregation: Aggregation[], interval?: moment.Duration) {
        this.metrics = metrics;
        this.aggregation = aggregation;
        this.interval = interval || defaultInterval;
        this._setTimeSpan();
    }

    /**
     *
     */
    public getRequestUrl(resourceId: string): string {
        return `${resourceId}/providers/Microsoft.Insights/metrics`;
    }

    /**
     *
     */
    public getRequestOptions(): RequestOptions {
        let search = new URLSearchParams();
        search.set(MetricsParams.Timespan, this._timeSpanParam);
        search.set(MetricsParams.Interval, this._intervalParam);
        search.set(MetricsParams.Metric, this._metricsParam);
        search.set(MetricsParams.Aggregation, this._aggregationParam);
        return new RequestOptions({ search });
    }

    /**
     * Set timespan start and end, these variables are used to construct request url
     * Timespan start and timespan end are two ISO format string
     */
    private _setTimeSpan(): void {
        const timespan = moment();
        this._timeSpanEnd = timespan.toISOString();
        timespan.subtract(defaultTimeSpan);
        this._timeSpanStart = timespan.toISOString();
    }

    /**
     *
     */
    private get _timeSpanParam(): string {
        return `${this._timeSpanStart}/${this._timeSpanEnd}`;
    }

    /**
     *
     */
    private get _intervalParam(): string {
        return `${this.interval.toISOString()}`;
    }

    /**
     *
     */
    private get _metricsParam(): string {
        return `${this.metrics.join(parameterDelimiter)}`;
    }

    /**
     *
     */
    private get _aggregationParam(): string {
        return `${this.aggregation.join(parameterDelimiter)}`;
    }
}
