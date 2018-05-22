import { Component, OnChanges } from "@angular/core";
import { PerformanceGraphComponent } from "../performance-graph.component";

import { BatchPerformanceMetricType, PerformanceMetric } from "app/models/app-insights/metrics-result";

@Component({
    selector: "bl-disk-usage-graph",
    templateUrl: "disk-usage-graph.html",
})
export class DiskUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "B";

    public diskUsages: PerformanceMetric[] = [];
    public _diskAvailable: number;

    constructor() {
        super();
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._clearMetricSubs();
            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskUsed).subscribe((data) => {
                this.diskUsages = data;
                this.updateData();
            }));

            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskFree).subscribe((data) => {
                const last = data.last();
                if (last) {
                    this._diskAvailable = last.value;
                    this._updateMax();
                    this.updateData();
                }
            }));
        }
    }

    public updateData() {
        this.datasets = [
            {
                data: [
                    ...this.diskUsages.map(x => {
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

    private _updateMax() {
        const max = this._computeDiskCapacity();
        if (max !== this.max) {
            this.max = max;
            this.updateOptions();
        }
    }

    private _computeDiskCapacity() {
        const data = this.diskUsages;
        if (data && data.length > 0) {
            return this._diskAvailable + data.last().value;
        } else {
            return undefined;
        }
    }
}
