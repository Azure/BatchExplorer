import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { Router } from "@angular/router";
import {
    NodesPerformanceMetric,
    PerformanceMetric,
} from "app/models/app-insights/metrics-result";
import { PerformanceGraphComponent } from "../performance-graph.component";

import "./cpu-usage-graph.scss";

@Component({
    selector: "bl-cpu-usage-graph",
    templateUrl: "cpu-usage-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpuUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    @Input() public showIndividualCpu = false;

    public max = 100;
    public unit = "%";

    public cpuUsages: NodesPerformanceMetric = {};
    public individualCpuUsages: PerformanceMetric[][] = [];
    public cpuCount = 1;
    public showOverallUsage = true;
    public lastCpuUsage: PerformanceMetric;
    public lastIndividualCpuUsage: PerformanceMetric[];

    constructor(router: Router, changeDetector: ChangeDetectorRef) {
        super(router, changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this.cpuUsages = this.data.cpuUsage || {};
            this.individualCpuUsages = this.data.individualCpuUsage || [];
            if (this.individualCpuUsages) {
                this.cpuCount = this.individualCpuUsages.length;
                this.lastIndividualCpuUsage = this.individualCpuUsages.map(x => x.last());
            }
            this._updateStatus();
            this.updateData();

        }
    }

    public updateData() {
        if (this.showOverallUsage) {
            this._showOverallCpuUsage();
        } else {
            this._showIndiviualCpuUsage();
        }
        this.changeDetector.markForCheck();
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    public trackCpu(index) {
        return index;
    }

    private _showOverallCpuUsage() {
        if (this.cpuUsages) {
            this.datasets = this._getDatasetsGroupedByNode(this.cpuUsages, "rgb(9, 94, 168)");
        } else {
            this.datasets = [];
        }
    }

    private _showIndiviualCpuUsage() {
        // if (this.cpuUsages.length === 0) {
        //     this._showOverallCpuUsage();
        //     return;
        // }

        this.datasets = this.individualCpuUsages.map((usages, cpuN) => {
            return {
                data: usages.map(x => {
                    return {
                        x: x.time,
                        y: x.value,
                    };
                }),
                fill: false,
                borderWidth: 1,
            };
        });
    }

    private _updateStatus() {
        if (this.lastCpuUsage) {
            this.status.next(`${this.lastCpuUsage.value}%`);
        } else {
            this.status.next("- %");
        }
    }
}
