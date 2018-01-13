import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";

import {
    CoreCountMetrics, FailedTaskMetrics, MonitorChartTimeFrame, MonitorChartType,
    MonitorMetrics, NodeStatesMetrics, TaskStatesMetrics,
} from "app/services";
import { AccountService } from "../account.service";
import { ArmHttpService } from "../arm-http.service";

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

/**
 * Wrapper around the http service so call the azure ARM monitor api.
 */
@Injectable()
export class MonitorHttpService {
    private _coreCountMetrics: MonitorMetrics;
    private _taskStateMetrics: MonitorMetrics;
    private _failedTaskMetrics: MonitorMetrics;
    private _nodeStateMetrics: MonitorMetrics;

    constructor(private accountService: AccountService, private armService: ArmHttpService) {
        this._coreCountMetrics = new CoreCountMetrics();
        this._taskStateMetrics = new TaskStatesMetrics();
        this._failedTaskMetrics = new FailedTaskMetrics();
        this._nodeStateMetrics = new NodeStatesMetrics();
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
    public getCoreCount() {
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._coreCountMetrics, resourceId);
        }).share();
    }

    /**
     * Get task state observable for rendering task states
     */
    public getTaskStates() {
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._taskStateMetrics, resourceId);
        }).share();
    }

    /**
     * Get failed task observable for rendering failed task
     */
    public getFailedTask() {
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._failedTaskMetrics, resourceId);
        }).share();
    }

    /** Get node states observable for rendering node states */
    public getNodeStates() {
        // Note that here only take first word to truncate legends for node states chart
        return this._getCurrentAccount().flatMap(resourceId => {
            return this._getMetrics(this._nodeStateMetrics, resourceId, (name) => {
                return name.replace(" node count", "").replace("nodecount", "");
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
    private _getMetrics(metric: MonitorMetrics, resourceId: string, customNameFunc?: (name: string) => string) {
        if (resourceId) {
            const url = metric.getRequestUrl(resourceId);
            const options = metric.getRequestOptions();
            return this.armService.get(url, options).flatMap(value => {
                const metrics: Metric[] = value.json().value.map((object): Metric => {
                    object.name.localizedValue = this._convertToSentenceCase(object.name.localizedValue);
                    object.name.value = object.name.value.toLowerCase();
                    // format localized name
                    const localizedValue = object.name.localizedValue;
                    const nameValue = object.name.value;

                    if (customNameFunc) {
                        object.name.localizedValue = customNameFunc(localizedValue);
                        object.name.value = customNameFunc(nameValue);
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
                return Observable.of(metrics);
            });
        }
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
