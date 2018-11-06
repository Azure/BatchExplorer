import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Metric, MetricValue, MonitoringMetricList } from "app/models/monitoring";
import { ArmHttpService } from "app/services/arm-http.service";
import { BatchAccountService } from "app/services/batch-account";
import { flatMap, map, share, take } from "rxjs/operators";
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
        private accountService: BatchAccountService,
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
        return this.accountService.currentAccount.pipe(
            map(account => account && account.id),
            take(1),
            share(),
        );
    }

    /**
     * Actual request being sent to monitor api. Convert response to simplified objects which could be
     * directly used by chartjs datasets
     */
    private _fetchMetrics(metric: MonitoringMetricDefinition) {
        const options = metric.getRequestOptions();
        return this._getCurrentAccount().pipe(
            flatMap((resourceId) => this.armService.get(metric.getRequestUrl(resourceId), options)),
            map(response => this._processResponse(metric, response)),
            share(),
        );
    }

    private _processResponse(request: MonitoringMetricDefinition, response: any) {
        const metrics: Metric[] = response.value.map((object, index): Metric => {
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
            interval: response.interval,
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
