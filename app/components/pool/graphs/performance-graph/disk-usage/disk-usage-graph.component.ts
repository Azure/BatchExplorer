import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import { Router } from "@angular/router";

import { BatchPerformanceMetricType, PerformanceMetric } from "app/models/app-insights/metrics-result";
import { PoolUtils } from "app/utils";
import { Aggregation, PerformanceGraphComponent } from "../performance-graph.component";

import "./disk-usage-graph.scss";

interface Disk {
    name: string;
    label: string;
}

@Component({
    selector: "bl-disk-usage-graph",
    templateUrl: "disk-usage-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiskUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "B";
    public currentDisk;
    public availableDisks: Disk[] = [];
    public aggregation: Aggregation = Aggregation.Each;
    public 5;
    public diskUsages: StringMap<StringMap<PerformanceMetric[]>> = {};
    public diskFree: StringMap<StringMap<PerformanceMetric[]>> = {};

    constructor(router: Router, changeDetector: ChangeDetectorRef) {
        super(router, changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._clearMetricSubs();
            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskUsed).subscribe((data) => {
                this.diskUsages = data as any;
                this._updateMax();
                this.updateData();
            }));

            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskFree).subscribe((data) => {
                this._computeDisks(Object.keys(data));
                const disk = Object.keys(data).first();
                if (!disk) { return; }
                this.diskFree = data;
                if (this.availableDisks.length > 0) {
                    if (!this.currentDisk || !this.availableDisks.find(x => x.name === this.currentDisk)) {
                        this.currentDisk = this._getDefaultDisk();
                    }
                }
                this._updateMax();
                this.updateData();
            }));
        }
    }

    public updateData() {
        if (this.aggregation === Aggregation.Each) {
            const data = this.diskUsages[this.currentDisk] || {} as any;
            this.datasets = this._getDatasetsGroupedByNode(data, "rgb(103, 169, 10)");
        }
        this.changeDetector.markForCheck();
    }

    public pickCurrentDisk(disk: string) {
        this.currentDisk = disk;
        this._updateMax();
        this.updateData();
    }

    public trackDisk(index, disk: Disk) {
        return disk.name;
    }

    private _updateMax() {
        const max = this._computeDiskCapacity();
        if (max !== this.max) {
            this.max = max;
            this.updateOptions();
        }
    }

    private _computeDiskCapacity() {
        const usages = this.diskUsages[this.currentDisk];
        const free = this.diskFree[this.currentDisk];
        if (usages && free) {
            const nodeId = Object.keys(usages).first();
            if (usages[nodeId] && free[nodeId]) {
                return usages[nodeId].last().value + free[nodeId].last().value;
            }
        }
        return undefined;
    }

    private _computeDisks(disks: string[]) {
        this.availableDisks = disks.map(x => {
            return {
                name: x,
                label: this._labelForDisk(x),
            };
        });
    }

    private _labelForDisk(disk: string) {
        const isCloudService = this.data.pool.cloudServiceConfiguration;
        let type = "";

        if (isCloudService) {
            switch (disk) {
                case "C:/":
                    type = "(User disk)";
                    break;
                case "D:/":
                    type = "(OS disk)";
                    break;
            }
        } else {
            switch (disk) {
                case "C:/":
                case "/":
                    type = "(OS disk)";
                    break;
                case "D:/":
                case "/mnt":
                case "/mnt/resources":
                    type = "(User disk)";
                    break;
            }
        }

        return `${disk} ${type}`;
    }

    // Show the user disk if possible
    private _getDefaultDisk() {
        const isCloudService = this.data.pool.cloudServiceConfiguration;
        const isWindows = PoolUtils.isWindows(this.data.pool);
        if (isCloudService) {
            return "C:/";
        } else if (isWindows) {
            return "D:/";
        } else if (this.availableDisks.length > 0) {
            return this.availableDisks.first().name;
        }
    }
}
