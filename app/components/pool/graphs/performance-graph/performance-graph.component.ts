import { Component, Input, OnChanges } from "@angular/core";
import { Subscription } from "rxjs";

import { HistoryItem } from "app/components/pool/graphs/history-data/history-data-base";
import { NumberUtils } from "app/utils";
import { AppInsightsPerformanceMetrics, PerformanceData } from "./performance-data";
import "./performance-graph.scss";

export enum BatchUsageMetrics {
    cpu = "cpu",
    memory = "memory",
    disk = "disk",
    network = "network",
}

export const performanceGraphs = {
    [BatchUsageMetrics.cpu]: {
        metrics: [AppInsightsPerformanceMetrics.cpuUsage],
        unit: "%",
    },
    [BatchUsageMetrics.memory]: {
        metrics: [AppInsightsPerformanceMetrics.memoryAvailable],
        unit: "B",
    },
    [BatchUsageMetrics.disk]: {
        metrics: [AppInsightsPerformanceMetrics.diskRead, AppInsightsPerformanceMetrics.diskWrite],
        unit: "Bps",
    },
    [BatchUsageMetrics.network]: {
        metrics: [AppInsightsPerformanceMetrics.networkRead, AppInsightsPerformanceMetrics.networkWrite],
        unit: "Bps",
    },
};
@Component({
    selector: "bl-performance-graph",
    templateUrl: "performance-graph.html",
})
export class PerformanceGraphComponent implements OnChanges {
    @Input() public interactive: boolean = true;
    @Input() public data: PerformanceData;
    @Input() public metric: BatchUsageMetrics = BatchUsageMetrics.disk;

    public type = "line";
    public datasets: Chart.ChartDataSets[] = [];
    public options = {};
    public max = 100;

    public history: StringMap<HistoryItem[]> = {};
    private _metricSubs: Subscription[] = [];
    private _metrics: AppInsightsPerformanceMetrics[] = [];
    private _memoryUsed = 0;

    constructor() {
        this._metrics = performanceGraphs[this.metric].metrics;
    }

    public ngOnChanges(changes) {
        if (changes.metric) {
            this._metrics = performanceGraphs[this.metric].metrics;
            this._updateMax();
        }
        if (changes.data || changes.metric) {
            this._clearMetricSubs();
            this.updateOptions();
            for (const metricName of this._metrics) {
                this._metricSubs.push(this.data.observeMetric(metricName).subscribe((history) => {
                    this.history[metricName] = history;
                    this._updateMax();
                    this.updateData();
                }));
            }

            if (this.metric === BatchUsageMetrics.memory) {
                this._metricSubs.push(this.data.observeMetric(AppInsightsPerformanceMetrics.memoryUsed)
                    .subscribe((history) => {
                        if (history.length > 0) {
                            this._memoryUsed = history.last().y;
                            this._updateMax();
                        }
                    }));
            }
        }
    }

    public updateOptions() {
        const hitRadius = this.interactive ? 10 : 0;
        this.options = {
            responsive: true,
            elements: {
                point: { radius: 0, hitRadius: hitRadius, hoverRadius: hitRadius },
                line: {
                    tension: 0.05, // disables bezier curves
                },
            },
            legend: {
                display: false,
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    display: this.interactive,
                    ticks: {
                        max: this.max, // Need to have max slightly more otherwise the line get's cut.
                        min: 0,
                        autoSkip: true,
                        callback: (value) => {
                            if (value % 1 === 0) {
                                return NumberUtils.prettyMagnitude(value, performanceGraphs[this.metric].unit);
                            }
                        },
                    },
                }],
                xAxes: [{
                    type: "time",
                    position: "bottom",
                    display: this.interactive,
                }],
            },
        };
    }

    /**
     * Transform the input data into datasets for the chart.
     */
    public updateData() {
        this.datasets = this._metrics.filter(x => Boolean(this.history[x])).map((metric) => {
            return {
                data: [
                    ...this.history[metric].map(x => {
                        return {
                            x: new Date(x.time),
                            y: x.y,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
            };
        });
    }

    private _updateMax() {
        let max;
        switch (this.metric) {
            case BatchUsageMetrics.cpu:
                max = 100;
                break;
            case BatchUsageMetrics.memory:
                max = this._computeTotalMemory();
                break;
            default:
                max = undefined;
        }

        if (this.max !== max) {
            this.max = max;
            this.updateOptions();
        }
    }

    private _computeTotalMemory() {
        const data = this.history[AppInsightsPerformanceMetrics.memoryAvailable];
        if (data && data.length > 0) {
            return this._memoryUsed + data.last().y;
        } else {
            return undefined;
        }
    }

    private _clearMetricSubs() {
        this._metricSubs.forEach(x => x.unsubscribe());
        this._metricSubs = [];
    }
}
