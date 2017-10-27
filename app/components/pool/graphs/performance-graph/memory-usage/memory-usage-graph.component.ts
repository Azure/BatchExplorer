import { Component, OnChanges } from "@angular/core";
import { NumberUtils } from "app/utils";
import { AppInsightsPerformanceMetrics, PerformanceMetric } from "../performance-data";
import { BatchUsageMetrics, PerformanceGraphComponent } from "../performance-graph.component";

@Component({
    selector: "bl-memory-usage-graph",
    templateUrl: "memory-usage-graph.html",
})
export class MemoryUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public max = 100;
    public unit = "%";
    public metric = BatchUsageMetrics.cpu;

    public memUsages: PerformanceMetric[] = [];
    public showOverallUsage = true;
    private _memoryAvailable: number;

    constructor() {
        super();
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._metricSubs.push(this.data.observeMetric(AppInsightsPerformanceMetrics.memoryUsed)
                .subscribe((data) => {
                    console.log("Got data?", data);
                    this.memUsages = data;
                    this._updateStatus();
                    this.updateData();
                }));
            this._metricSubs.push(this.data.observeMetric(AppInsightsPerformanceMetrics.memoryAvailable)
                .subscribe((data) => {
                    const last = data.last();
                    if (last) {
                        this._memoryAvailable = last.value;
                        this._updateMax();
                        this._updateStatus();
                    }
                }));
        }
    }

    public updateData() {
        this.datasets = [
            {
                data: [
                    ...this.memUsages.map(x => {
                        return {
                            x: x.time,
                            y: x.value,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
            },
        ];
    }

    public changeShowOverallUsage(newValue) {
        console.log("Change show oevrral", newValue);
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _updateMax() {
        const max = this._computeTotalMemory();
        if (max !== this.max) {
            this.max = max;
            console.log("new max is", max);
            this.updateOptions();
        }
    }

    private _updateStatus() {
        if (this._memoryAvailable && this.memUsages.length > 0) {
            const used = this.memUsages.last().value;
            const percent = (used / this.max * 100).toFixed(2);
            const exponent = NumberUtils.magnitudeExponent(this.max);
            const prettyTotal = NumberUtils.prettyMagnitude(this.max);
            const prettyUsed = (used / Math.pow(1000, exponent)).toPrecision(3);

            this.status.next(`${prettyUsed}/${prettyTotal}B (${percent}%)`);
        } else {
            this.status.next("- B");
        }
    }

    private _computeTotalMemory() {
        const data = this.memUsages;
        if (data && data.length > 0) {
            return this._memoryAvailable + data.last().value;
        } else {
            return undefined;
        }
    }
}
