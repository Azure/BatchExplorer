import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import { PerformanceGraphComponent } from "../performance-graph.component";

import { BatchPerformanceMetricType, PerformanceMetric } from "app/models/app-insights/metrics-result";

import "./disk-usage-graph.scss";

@Component({
    selector: "bl-disk-usage-graph",
    templateUrl: "disk-usage-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiskUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "B";
    public currentDisk;

    public diskUsages: StringMap<PerformanceMetric[]> = {};
    public _diskAvailable: number;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._clearMetricSubs();
            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskUsed).subscribe((data) => {
                this.diskUsages = data as any;
                this.updateData();
            }));

            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskFree).subscribe((data) => {
                console.log("Data here", data);
                const disk = Object.keys(data).first();
                if (!disk) { return; }

                const last = data[disk].last();
                if (last) {
                    console.log("LAt", last);
                    this._diskAvailable = last.value;
                    this.currentDisk = disk;
                    this._updateMax();
                    this.updateData();
                }
            }));
        }
    }

    public updateData() {
        const data = this.diskUsages[this.currentDisk] || [];
        this.datasets = [
            {
                data: [
                    ...data.map(x => {
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
        this.changeDetector.markForCheck();
    }

    private _updateMax() {
        const max = this._computeDiskCapacity();
        if (max !== this.max) {
            this.max = max;
            this.updateOptions();
        }
    }

    private _computeDiskCapacity() {
        const data = this.diskUsages[this.currentDisk];
        if (data) {
            return this._diskAvailable + data.last().value;
        } else {
            return undefined;
        }
    }
}
