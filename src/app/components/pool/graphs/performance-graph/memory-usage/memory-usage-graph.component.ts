import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import { Router } from "@angular/router";
import {
    NodesPerformanceMetric,
} from "app/models/app-insights/metrics-result";
import { NumberUtils } from "app/utils";
import { Aggregation, PerformanceGraphComponent } from "../performance-graph.component";

@Component({
    selector: "bl-memory-usage-graph",
    templateUrl: "memory-usage-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoryUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public max = null;
    public unit = "B";

    public memUsages: NodesPerformanceMetric = {};
    public showOverallUsage = true;
    public aggregation: Aggregation = Aggregation.Each;
    private _memoryAvailable: NodesPerformanceMetric = {};

    constructor(router: Router, changeDetector: ChangeDetectorRef) {
        super(router, changeDetector);
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._memoryAvailable = this.data.memoryAvailable || {};
            this.memUsages = this.data.memoryUsed  || {};
            this._updateStatus();
            this._updateMax();
            this.updateData();

        }
    }

    public updateData() {
        if (this.aggregation === Aggregation.Each) {
            this.datasets = this._getDatasetsGroupedByNode(this.memUsages, "rgb(137, 11, 170)");
        }
        this.changeDetector.markForCheck();
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _updateMax() {
        const max = this._computeTotalMemory();
        if (max !== this.max) {
            this.max = max;
            this.updateOptions();
        }
    }

    private _updateStatus() {
        if (this.max) {
            const total = this.max * Object.keys(this.memUsages).length;
            let sum = 0;
            for (const nodeId of Object.keys(this.memUsages)) {
                const last = this.memUsages[nodeId].last();
                if (last) {
                    sum += last.value;
                }
            }
            const percent = (sum / total * 100).toFixed(2);
            const prettyTotal = NumberUtils.prettyMagnitude(total);
            const exponent = NumberUtils.magnitudeExponent(total);
            const prettyUsed = (sum / Math.pow(1000, exponent)).toPrecision(3);

            this.status.next(`${prettyUsed}/${prettyTotal}B (${percent}%)`);
        }
    }

    private _computeTotalMemory() {
        const nodeId = Object.keys(this.memUsages).first();
        if (this.memUsages[nodeId] && this._memoryAvailable[nodeId]) {
            const lastUsage = this.memUsages[nodeId].last();
            const lastAvailable = this._memoryAvailable[nodeId].last();
            if (lastUsage && lastAvailable) {
                return lastUsage.value + lastAvailable.value;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }
}
