import { RequestOptions, URLSearchParams } from "@angular/http";
import * as moment from "moment";

/**
 * TimeFrame defines the enumeration for monitor chart timeframe picker
 */
export enum MonitorChartTimeFrame {
    Hour = "1h",
    Day = "1d",
    Week = "1w",
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
 * MonitorMetrics defines the class signature of monitor chart instances
 */
export interface MonitorMetrics {
    metrics: MonitorChartMetrics[];
    aggregation: MonitorChartAggregation[];
    colors: MonitorChartColorPair[];
    setTimeFrame(timeFrame: MonitorChartTimeFrame): void;
    getRequestUrl(resourceId: string): string;
    getRequestOptions(): RequestOptions;
}

/**
 * Timespan and interval constants used for rendering the charts
 */
const hourTimeSpan = moment.duration({ hours: 1 });
const dayTimeSpan = moment.duration({ days: 1 });
const weekTimeSpan = moment.duration({ weeks: 1 });
const minInterval = moment.duration({ minutes: 1 });
const quarterHourInterval = moment.duration({ minutes: 15 });
const oneHoursInterval = moment.duration({ hours: 1 });
const parameterDelimiter = ",";

export class MonitorMetricsBase implements MonitorMetrics {
    public metrics: MonitorChartMetrics[];
    public aggregation: MonitorChartAggregation[];
    public colors: MonitorChartColorPair[];

    // Set internally
    // supported interval are: 00:01:00,00:05:00,00:15:00,00:30:00,01:00:00,06:00:00,12:00:00,1.00:00:00
    private _interval: moment.Duration;
    private _timeSpanStart: string;
    private _timeSpanEnd: string;

    constructor(metrics: MonitorChartMetrics[], aggregation: MonitorChartAggregation[] ) {
        this.metrics = metrics;
        this.aggregation = aggregation;
        this.setTimeFrame(MonitorChartTimeFrame.Hour);
    }

    /** Set theme colors after calling themeService */
    public setColor(colors?: MonitorChartColorPair[]) {
        this.colors = colors;
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
        search.set(MonitorChartMetricsParams.Timespan, this._timeSpanParam);
        search.set(MonitorChartMetricsParams.Interval, this._intervalParam);
        search.set(MonitorChartMetricsParams.Metric, this._metricsParam);
        search.set(MonitorChartMetricsParams.Aggregation, this._aggregationParam);
        return new RequestOptions({ search });
    }

    /**
     * Function that sets timespan and interval monitor chart history
     * @param timeFrame
     */
    public setTimeFrame(timeFrame: MonitorChartTimeFrame): void {
        switch (timeFrame) {
            case MonitorChartTimeFrame.Hour:
                this._interval = minInterval;
                break;
            case MonitorChartTimeFrame.Day:
                this._interval = quarterHourInterval;
                break;
            case MonitorChartTimeFrame.Week:
                this._interval = oneHoursInterval;
                break;
        }
        this._setTimeSpan(timeFrame);
    }

    /**
     * Set timespan start and end, these variables are used to construct request url
     * Timespan start and timespan end are two ISO format string
     */
    private _setTimeSpan(timeFrame: MonitorChartTimeFrame): void {
        const timespan = moment();
        this._timeSpanEnd = timespan.toISOString();
        switch (timeFrame) {
            case MonitorChartTimeFrame.Hour:
                timespan.subtract(hourTimeSpan);
                break;
            case MonitorChartTimeFrame.Day:
                timespan.subtract(dayTimeSpan);
                break;
            case MonitorChartTimeFrame.Week:
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
