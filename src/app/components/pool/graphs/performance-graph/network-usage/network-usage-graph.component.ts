import { ChangeDetectorRef, Component, OnChanges, ChangeDetectionStrategy } from "@angular/core";
import { Router } from "@angular/router";
import { NodesPerformanceMetric } from "app/models/app-insights/metrics-result";
import { NumberUtils } from "app/utils";
import { PerformanceGraphComponent } from "../performance-graph.component";

@Component({
    selector: "bl-network-usage-graph",
    templateUrl: "network-usage-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "Bps";

    public netReadUsages: NodesPerformanceMetric = {};
    public netWriteUsages: NodesPerformanceMetric = {};
    public showOverallUsage = true;

    constructor(router: Router, changeDetector: ChangeDetectorRef) {
        super(router, changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this.netReadUsages = this.data.networkRead || {};
            this.netWriteUsages = this.data.networkWrite || {};
            this._updateStatus();
            this.updateData();
        }
    }

    public updateData() {
        this.datasets = [
            ...this._getDatasetsGroupedByNode(this.netReadUsages, "rgb(178, 95, 7)", "Network download speed"),
            ...this._getDatasetsGroupedByNode(this.netWriteUsages, "rgba(178, 95, 7, 0.3)", "Network upload speed"),
        ];
        this.changeDetector.markForCheck();
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
