import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";

import {
    CoreCountMetrics, FailedTaskMetrics, MonitorChartTimeFrame, MonitorChartType,
    MonitorMetrics, NodeStatesMetrics, TaskStatesMetrics,
} from "app/services";
import { AccountService } from "../account.service";
import { ArmHttpService } from "../arm-http.service";
import { ThemeService } from "../themes";

export interface LocalizableString {
    value: string;
    localizedValue: string;
}

export interface MetricValue {
    timeStamp: string;
    total: string;
}

export interface Metric {
    name: LocalizableString;
    data: MetricValue[];
    color: string;
}

export interface MetricResponse {
    timeFrame: MonitorChartTimeFrame;
    metrics: Metric[];
}

/**
 * Wrapper around the http service so call the azure ARM monitor api.
 */
@Injectable()
export class InsightsMetricsService {
    private _coreCountMetrics: MonitorMetrics;
    private _taskStateMetrics: MonitorMetrics;
    private _failedTaskMetrics: MonitorMetrics;
    private _nodeStateMetrics: MonitorMetrics;

    constructor(
        themeService: ThemeService,
        private accountService: AccountService,
        private armService: ArmHttpService) {
        this._coreCountMetrics = new CoreCountMetrics(themeService);
        this._taskStateMetrics = new TaskStatesMetrics(themeService);
        this._failedTaskMetrics = new FailedTaskMetrics(themeService);
        this._nodeStateMetrics = new NodeStatesMetrics(themeService);
    }

    /**
     * updateTimeFrame is event handler when different time frame is selected
     * @param timeframe
     * @param chartType
     */
    public updateTimeFrame(timeframe: MonitorChartTimeFrame, chartType: MonitorChartType) {
        switch (chartType) {
            case MonitorChartType.CoreCount:
                this._coreCountMetrics.setTimeFrame(timeframe);
                break;
            case MonitorChartType.TaskStates:
                this._taskStateMetrics.setTimeFrame(timeframe);
                break;
            case MonitorChartType.FailedTask:
                this._failedTaskMetrics.setTimeFrame(timeframe);
                break;
            case MonitorChartType.NodeStates:
                this._nodeStateMetrics.setTimeFrame(timeframe);
                break;
        }
    }

    /**
     * Get core counts observable for rendering core count
     */
    public getCoreCount(): Observable<MetricResponse> {
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._coreCountMetrics, resourceId, (name) => {
                // trim ending words for a shorter label
                return name.replace(" core count", "");
            });
        }).share();
    }

    /**
     * Get task state observable for rendering task states
     */
    public getTaskStates(): Observable<MetricResponse> {
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._taskStateMetrics, resourceId);
        }).share();
    }

    /**
     * Get failed task observable for rendering failed task
     */
    public getFailedTask(): Observable<MetricResponse> {
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._failedTaskMetrics, resourceId);
        }).share();
    }

    /** Get node states observable for rendering node states */
    public getNodeStates(): Observable<MetricResponse> {
        // Note that here only take first word to truncate legends for node states chart
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._nodeStateMetrics, resourceId, (name) => {
                // trim ending words for a shorter label
                return name.replace(" node count", "");
            });
        }).share();
    }

    /**
     * Get account observable for rendering selected account metrics
     */
    private _getCurrentAccount() {
        return this.accountService.currentAccount.flatMap(account => {
            return Observable.of(account && account.id);
        }).share();
    }

    /**
     * Actual request being sent to monitor api. Convert response to simplified objects which could be
     * directly used by chartjs datasets
     */
    private _getMetrics(metric: MonitorMetrics,
                        resourceId: string,
                        customNameFunc?: (name: string) => string): Observable<MetricResponse> {
        if (!resourceId) {
            return Observable.empty();
        }
        const url = metric.getRequestUrl(resourceId);
        const options = metric.getRequestOptions();
        return this.armService.get(url, options).flatMap(value => {
            const metrics: Metric[] = value.json().value.map((object): Metric => {
                object.name.localizedValue = this._convertToSentenceCase(object.name.localizedValue);
                object.name.value = object.name.value;
                // format localized name
                const localizedValue = object.name.localizedValue;

                if (customNameFunc) {
                    object.name.localizedValue = customNameFunc(localizedValue);
                }

                const colorFound = metric.colors.find((c) => c.state === object.name.value);
                const color = colorFound && colorFound.color;

                return {
                    name: object.name,
                    data: object.timeseries[0].data.map((data): MetricValue => {
                        return {
                            timeStamp: data.timeStamp,
                            total: data.total,
                        } as MetricValue;
                    }),
                    color: color,
                } as Metric;
            });
            return Observable.of({
                timeFrame: metric.timeFrame,
                metrics: metrics,
            });
        });
    }

    /**
     * Convert a string case to format like a sentence
     * @param text
     */
    private _convertToSentenceCase(text: string): string {
        return text.split(" ")
                .map((value, index) => index !== 0 ? value.toLowerCase() : value)
                .join(" ");
    }
}
