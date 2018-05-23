import { ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import { PerformanceGraphComponent } from "../performance-graph.component";

import { BatchPerformanceMetricType, NodesPerformanceMetric } from "app/models/app-insights/metrics-result";
import { NumberUtils } from "app/utils";

@Component({
    selector: "bl-network-usage-graph",
    templateUrl: "network-usage-graph.html",
})
export class NetworkUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "Bps";

    public netReadUsages: NodesPerformanceMetric = {};
    public netWriteUsages: NodesPerformanceMetric = {};
    public showOverallUsage = true;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._clearMetricSubs();
            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.networkRead)
                .subscribe((data) => {
                    this.netReadUsages = data;
                    this._updateStatus();
                    this.updateData();
                }));

            this._metricSubs.push(this.data.observeMetric(BatchPerformanceMetricType.networkWrite)
                .subscribe((data) => {
                    this.netWriteUsages = data;
                    this._updateStatus();
                    this.updateData();
                }));
        }
    }

    public updateData() {
        this.datasets = [
            ...this._getDatasetsGroupedByNode(this.netReadUsages, "rgb(178, 95, 7)", "Network download speed"),
            ...this._getDatasetsGroupedByNode(this.netWriteUsages, "rgba(178, 95, 7, 0.5)", "Network upload speed"),
        ];
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _updateStatus() {
        const read = this._getLast(this.netReadUsages);
        const write = this._getLast(this.netWriteUsages);
        this.status.next(`D: ${read}Bps, U: ${write}Bps`);

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
