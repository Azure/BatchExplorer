import { ChangeDetectorRef, Component, HostBinding, Input, OnChanges } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";

import { NodesPerformanceMetric, PerformanceMetric } from "app/models/app-insights/metrics-result";
import { NumberUtils } from "app/utils";
import { PerformanceData } from "./performance-data";
import "./performance-graph.scss";

export enum BatchUsageMetrics {
    cpu = "cpu",
    memory = "memory",
    disk = "disk",
    network = "network",
}

export enum Aggregation {
    Sum = "sum",
    Avg = "avg",
    Each = "each",
}

@Component({
    selector: "bl-performance-graph",
    templateUrl: "performance-graph.html",
})
export class PerformanceGraphComponent implements OnChanges {
    @Input() @HostBinding("class.interactive") public interactive: boolean = true;
    @Input() public data: PerformanceData;

    @HostBinding("class.bl-performance-graph") public baseCssCls = true;

    public type = "line";
    public unit = "";
    public datasets: Chart.ChartDataSets[] = [];
    public options = {};
    public status = new BehaviorSubject("");

    /**
     * Set the max of this graph.
     * Override in child(undefined calculate the max automatically)
     */
    public max = undefined;

    protected _metricSubs: Subscription[] = [];

    constructor(protected changeDetector: ChangeDetectorRef) {
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
            maintainAspectRatio: false,
            elements: {
                point: { radius: 0, hitRadius: hitRadius, hoverRadius: 3 },
                line: {
                    tension: 0.05, // disables bezier curves
                },
            },
            legend: {
                display: false,
            },
            tooltips: {
                enabled: this.interactive,
                mode: "nearest",
                callbacks: {
                    label: (tooltipItems, data) => {
                        return this._getToolTip(tooltipItems);
                    },
                },
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
                                return NumberUtils.prettyMagnitude(value, this.unit);
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
        this.changeDetector.markForCheck();
    }

    protected _clearMetricSubs() {
        this._metricSubs.forEach(x => x.unsubscribe());
        this._metricSubs = [];
    }

    protected _getToolTip(tooltipItem: Chart.ChartTooltipItem) {
        const dataset = this.datasets[tooltipItem.datasetIndex];
        const label = dataset && dataset.label || "";
        return [
            `${NumberUtils.prettyMagnitude(tooltipItem.yLabel as any, this.unit)} ${label}`,
        ];
    }

    protected _getDatasetsGroupedByNode(data: NodesPerformanceMetric, color?: string, label?: string) {
        return Object.keys(data).map((nodeId) => {
            const usages = data[nodeId];
            let computedLabel = nodeId;
            if (label) {
                computedLabel = `${label} ${nodeId}`;
            }
            return {
                data: [
                    ...usages.map(x => this._dataPointFromMetric(x)),
                ],
                fill: false,
                borderWidth: 1,
                borderColor: color,
                label: computedLabel,
            };
        });
    }

    protected _dataPointFromMetric(metric: PerformanceMetric) {
        return {
            x: metric.time,
            y: metric.value,
        };
    }
}
