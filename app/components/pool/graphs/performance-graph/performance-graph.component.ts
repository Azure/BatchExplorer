import { ChangeDetectorRef, Component, HostBinding, Input, OnChanges } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";

import { NumberUtils } from "app/utils";
import { PerformanceData } from "./performance-data";
import "./performance-graph.scss";

export enum BatchUsageMetrics {
    cpu = "cpu",
    memory = "memory",
    disk = "disk",
    network = "network",
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
        return [
            NumberUtils.prettyMagnitude(tooltipItem.yLabel as any, this.unit),
        ];
    }
}
