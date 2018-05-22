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
    public availableDisks;

    public diskUsages: StringMap<PerformanceMetric[]> = {};
    public diskFree: StringMap<number> = {};

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
                this.availableDisks = Object.keys(data);
                const disk = Object.keys(data).first();
                if (!disk) { return; }
                const free = {};
                for (const disk of Object.keys(data)) {
                    const last = data[disk].last();
                    if (last) {
                        free[disk] = last.value;
                    }
                }

                if (!this.currentDisk) {
                    this.currentDisk = this.availableDisks.first();
                }
                this._updateMax();
                this.updateData();
                this.diskFree = free;
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

    public pickCurrentDisk(disk: string) {
        this.currentDisk = disk;
        this._updateMax();
        this.updateData();
    }

    public trackDisk(index, disk: string) {
        return disk;
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
            return this.diskFree[this.currentDisk] + data.last().value;
        } else {
            return undefined;
        }
    }
}
