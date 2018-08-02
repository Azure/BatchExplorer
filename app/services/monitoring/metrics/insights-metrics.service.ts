import { Injectable } from "@angular/core";
import { Response } from "@angular/http";
import { Observable } from "rxjs";

import { Metric, MetricValue, MonitoringMetricList } from "app/models/monitoring";
import { AccountService } from "app/services/account.service";
import { ArmHttpService } from "app/services/arm-http.service";
import { ThemeService } from "app/services/themes";
import { CoreCountMetrics } from "./core-count-metrics";
import { FailedTaskMetrics } from "./failed-task-metrics";
import { MonitorChartTimeFrame, MonitoringMetricDefinition } from "./monitor-metrics-base";
import { NodeStatesMetrics } from "./node-states-metrics";
import { TaskStatesMetrics } from "./task-states-metrics";

/**
 * Wrapper around the http service so call the azure ARM monitor api.
 */
@Injectable()
export class InsightsMetricsService {

    constructor(
        themeService: ThemeService,
        private accountService: AccountService,
        private armService: ArmHttpService) {
    }

    /**
     * Get core counts observable for rendering core count
     */
    public getCoreMinutes(timespan: MonitorChartTimeFrame): Observable<MonitoringMetricList> {
        return this._fetchMetrics(new CoreCountMetrics(timespan));
    }

    /**
     * Get task state observable for rendering task states
     */
    public getTaskStates(timespan: MonitorChartTimeFrame): Observable<MonitoringMetricList> {
        return this._fetchMetrics(new TaskStatesMetrics(timespan));
    }

    /**
     * Get failed task observable for rendering failed task
     */
    public getFailedTask(timespan: MonitorChartTimeFrame): Observable<MonitoringMetricList> {
        return this._fetchMetrics(new FailedTaskMetrics(timespan));
    }

    /** Get node states observable for rendering node states */
    public getNodeStates(timespan: MonitorChartTimeFrame): Observable<MonitoringMetricList> {
        // Note that here only take first word to truncate legends for node states chart
        return this._fetchMetrics(new NodeStatesMetrics(timespan));
    }

    /**
     * Get account observable for rendering selected account metrics
     */
    private _getCurrentAccount() {
        return this.accountService.currentAccount.flatMap(account => {
            return of(account && account.id);
        }).share();
    }

    /**
     * Actual request being sent to monitor api. Convert response to simplified objects which could be
     * directly used by chartjs datasets
     */
    private _fetchMetrics(metric: MonitoringMetricDefinition) {
        const options = metric.getRequestOptions();
        return this._getCurrentAccount()
            .flatMap((resourceId) => this.armService.get(metric.getRequestUrl(resourceId), options))
            .map(response => this._processResponse(metric, response))
            .share();
    }

    private _processResponse(request: MonitoringMetricDefinition, response: Response) {
        const data = response.json();
        const metrics: Metric[] = data.value.map((object, index): Metric => {
            const definition = request.metrics[index];
            const label = definition.label || this._convertToSentenceCase(object.name.localizedValue);
            let data = [];
            if (object.timeseries.length > 0) {
                data = object.timeseries[0].data.map((data): MetricValue => {
                    return data as MetricValue;
                });
            }

            return {
                name: object.name.value,
                label,
                data,
            } as Metric;
        });
        return new MonitoringMetricList({
            interval: data.interval,
            metrics: metrics,
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
