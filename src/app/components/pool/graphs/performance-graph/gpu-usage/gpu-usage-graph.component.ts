import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { Router } from "@angular/router";
import {
    NodesPerformanceMetric,
    PerformanceMetric,
} from "app/models/app-insights/metrics-result";
import { PerformanceGraphComponent } from "../performance-graph.component";

import "./gpu-usage-graph.scss";

@Component({
    selector: "bl-gpu-usage-graph",
    templateUrl: "gpu-usage-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GpuUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    @Input() public showIndividualGpu = false;

    public max = 100;
    public unit = "%";
    public gpuUsages: NodesPerformanceMetric = {};
    public individualGpuUsages: StringMap<PerformanceMetric[]> = {};
    public gpuCount = 1;
    public showOverallUsage = true;
    public lastGpuUsage: PerformanceMetric;
    public lastIndividualGpuUsage: PerformanceMetric[];

    constructor(router: Router, changeDetector: ChangeDetectorRef) {
        super(router, changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);
        if (changes.data) {
            this.gpuUsages = this.data.gpuUsage || {};

            this.individualGpuUsages = this.data.individualGpuUsage || {};
            if (this.individualGpuUsages) {
                this.gpuCount = Object.keys(this.individualGpuUsages).length;
            }
            this._updateStatus();
            this.updateData();
        }
    }

    public updateData() {
        if (this.showOverallUsage) {
            this._showOverallGpuUsage();
        } else {
            this._showIndiviualGpuUsage();
        }
        this.changeDetector.markForCheck();
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    public trackGpu(index) {
        return index;
    }

    private _showOverallGpuUsage() {
        this.datasets = this._getDatasetsGroupedByNode(this.gpuUsages, "rgb(9, 94, 168)");
    }

    private _showIndiviualGpuUsage() {
        this.datasets = Object.entries(this.individualGpuUsages).map(([gpuN, usages]) => {
            return {
                data: usages.map(x => {
                    return {
                        x: x.time,
                        y: x.value,
                    };
                }),
                label: `GPU #${gpuN}`,
                fill: false,
                borderWidth: 1,
            };
        });
    }

    private _updateStatus() {
        if (this.lastGpuUsage) {
            this.status.next(`${this.lastGpuUsage.value}%`);
        } else {
            this.status.next("- %");
        }
    }
}
