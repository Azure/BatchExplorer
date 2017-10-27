import { Component, Input, OnChanges } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";

import { NumberUtils } from "app/utils";
import { AppInsightsPerformanceMetrics, PerformanceData, PerformanceMetric } from "./performance-data";
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
        metrics: [AppInsightsPerformanceMetrics.memoryUsed],
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
    public status = new BehaviorSubject("");

    /**
     * Set the max of this graph.
     * Override in child(undefined calculate the max automatically)
     */
    public max = undefined;

    public history: StringMap<PerformanceMetric[]> = {};
    protected _metricSubs: Subscription[] = [];
    private _metrics: AppInsightsPerformanceMetrics[] = [];

    constructor() {
        this._metrics = performanceGraphs[this.metric].metrics;
        this.updateOptions();
    }

    public ngOnChanges(changes) {
        if (changes.data) {
            this.updateOptions();
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

    protected _clearMetricSubs() {
        this._metricSubs.forEach(x => x.unsubscribe());
        this._metricSubs = [];
    }
}
