import { ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import { Router } from "@angular/router";

import { BatchPerformanceMetricType, NodesPerformanceMetric } from "app/models/app-insights/metrics-result";
import { NumberUtils } from "app/utils";
import { PerformanceGraphComponent } from "../performance-graph.component";

@Component({
    selector: "bl-disk-io-graph",
    templateUrl: "disk-io-graph.html",
})
export class DiskIOGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "Bps";

    public diskReadUsages: NodesPerformanceMetric = {};
    public diskWriteUsages: NodesPerformanceMetric = {};
    public showOverallUsage = true;

    constructor(router: Router, changeDetector: ChangeDetectorRef) {
        super(router, changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._clearMetricSubs();
            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskRead).subscribe((data) => {
                this.diskReadUsages = data;
                this._updateStatus();
                this.updateData();
            }));

            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.diskWrite).subscribe((data) => {
                this.diskWriteUsages = data;
                this._updateStatus();
                this.updateData();
            }));
        }
    }

    public updateData() {
        this.datasets = [
            ...this._getDatasetsGroupedByNode(this.diskReadUsages, "rgb(26, 130, 31)", "Disk read speed"),
            ...this._getDatasetsGroupedByNode(this.diskWriteUsages, "rgba(26, 130, 31, 0.3)", "Disk write speed"),
        ];
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _updateStatus() {
        const read = this._getLast(this.diskReadUsages);
        const write = this._getLast(this.diskWriteUsages);
        this.status.next(`R: ${read}Bps, W: ${write}Bps`);
    }

    private _getLast(data: NodesPerformanceMetric) {
        let sum = 0;
        const nodes = Object.keys(data);

        if (nodes.length > 0) {
            for (const nodeId of nodes) {
                const last = data[nodeId].last();
                if (last) {
                    sum += last.value;
                }
            }
            return NumberUtils.prettyMagnitude(sum / nodes.length);
        } else {
            return `-`;
        }
    }
}
