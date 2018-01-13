import { RequestOptions, URLSearchParams } from "@angular/http";
import * as moment from "moment";

export enum TimeFrame {
    Hour = "1h",
    Day = "1d",
    Week = "1w",
}

export enum MonitorChartType {
    CoreCount = "coreCount",
    FailedTask = "failedTask",
    NodeStates = "nodeStates",
    TaskStates = "taskStates",
}

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

export interface MonitorChartColor {
    state: string;
    color: string;
}

const hourTimeSpan = moment.duration({ hours: 1 });
const dayTimeSpan = moment.duration({ days: 1 });
const weekTimeSpan = moment.duration({ weeks: 1 });
const minInterval = moment.duration({ minutes: 1 });
const quarterHourInterval = moment.duration({ minutes: 15 });
const oneHoursInterval = moment.duration({ hours: 1 });
const parameterDelimiter = ",";

export interface MonitorMetrics {
    metrics: Metrics[];
    aggregation: Aggregation[];
    colors: MonitorChartColor[];
    setTimeFrame(timeFrame: TimeFrame): void;
    getRequestUrl(resourceId: string): string;
    getRequestOptions(): RequestOptions;
}

export class MonitorMetricsBase implements MonitorMetrics {
    public metrics: Metrics[];
    public aggregation: Aggregation[];
    public colors: MonitorChartColor[];

    // Set internally
    // supported interval are: 00:01:00,00:05:00,00:15:00,00:30:00,01:00:00,06:00:00,12:00:00,1.00:00:00)
    private _interval: moment.Duration;
    private _timeSpanStart: string;
    private _timeSpanEnd: string;

    constructor(metrics: Metrics[], aggregation: Aggregation[], colors?: MonitorChartColor[]) {
        this.metrics = metrics;
        this.aggregation = aggregation;
        this.colors = colors;
        this.setTimeFrame(TimeFrame.Hour);
    }

    /**
     * Function that returns first half of the request url to Monitor api
     */
    public getRequestUrl(resourceId: string): string {
        return `${resourceId}/providers/Microsoft.Insights/metrics`;
    }

    /**
     * Function that returns RequestOptions which are sent to armService
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
     * Function that sets timespan and interval monitor chart history
     * @param timeFrame
     */
    public setTimeFrame(timeFrame: TimeFrame): void {
        switch (timeFrame) {
            case TimeFrame.Hour:
                this._interval = minInterval;
                break;
            case TimeFrame.Day:
                this._interval = quarterHourInterval;
                break;
            case TimeFrame.Week:
                this._interval = oneHoursInterval;
                break;
        }
        this._setTimeSpan(timeFrame);
    }

    /**
     * Set timespan start and end, these variables are used to construct request url
     * Timespan start and timespan end are two ISO format string
     */
    private _setTimeSpan(timeFrame: TimeFrame): void {
        const timespan = moment();
        this._timeSpanEnd = timespan.toISOString();
        switch (timeFrame) {
            case TimeFrame.Hour:
                timespan.subtract(hourTimeSpan);
                break;
            case TimeFrame.Day:
                timespan.subtract(dayTimeSpan);
                break;
            case TimeFrame.Week:
                timespan.subtract(weekTimeSpan);
                break;
        }
        this._timeSpanStart = timespan.toISOString();
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
        return `${this._interval.toISOString()}`;
    }

    /**
     * Get metric parameter value which is used for constructing request url
     */
    private get _metricsParam(): string {
        return `${this.metrics.join(parameterDelimiter)}`;
    }

    /**
     * Get aggregation parameter value which is used for constructing request url
     */
    private get _aggregationParam(): string {
        return `${this.aggregation.join(parameterDelimiter)}`;
    }
}
