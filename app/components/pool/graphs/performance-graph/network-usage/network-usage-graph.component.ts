import { ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import { PerformanceGraphComponent } from "../performance-graph.component";

import { BatchPerformanceMetricType, PerformanceMetric } from "app/models/app-insights/metrics-result";
import { NumberUtils } from "app/utils";

@Component({
    selector: "bl-network-usage-graph",
    templateUrl: "network-usage-graph.html",
})
export class NetworkUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "Bps";

    public netReadUsages: PerformanceMetric[] = [];
    public netWriteUsages: PerformanceMetric[] = [];
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
            {
                data: [
                    ...this.netReadUsages.map(x => {
                        return {
                            x: x.time,
                            y: x.value,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
                label: "Network download speed",
            },
            {
                data: [
                    ...this.netWriteUsages.map(x => {
                        return {
                            x: x.time,
                            y: x.value,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
                label: "Network upload speed",
            },
        ];
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _updateStatus() {
        if (this.netReadUsages.length > 0 && this.netWriteUsages.length > 0) {
            const read = NumberUtils.prettyMagnitude(this.netReadUsages.last().value);
            const write = NumberUtils.prettyMagnitude(this.netWriteUsages.last().value);
            this.status.next(`D: ${read}Bps, U: ${write}Bps`);
        } else {
            this.status.next("- %");
        }
    }
}
