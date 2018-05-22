import { ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import {  PerformanceGraphComponent } from "../performance-graph.component";

import { BatchPerformanceMetricType, PerformanceMetric } from "app/models/app-insights/metrics-result";
import { NumberUtils } from "app/utils";

@Component({
    selector: "bl-disk-io-graph",
    templateUrl: "disk-io-graph.html",
})
export class DiskIOGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public unit = "Bps";

    public diskReadUsages: PerformanceMetric[] = [];
    public diskWriteUsages: PerformanceMetric[] = [];
    public showOverallUsage = true;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
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
            {
                data: [
                    ...this.diskReadUsages.map(x => {
                        return {
                            x: x.time,
                            y: x.value,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
                label: "Disk read speed",
            },
            {
                data: [
                    ...this.diskWriteUsages.map(x => {
                        return {
                            x: x.time,
                            y: x.value,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
                label: "Disk write speed",
            },
        ];
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _updateStatus() {
        if (this.diskReadUsages.length > 0 && this.diskWriteUsages.length > 0) {
            const read = NumberUtils.prettyMagnitude(this.diskReadUsages.last().value);
            const write = NumberUtils.prettyMagnitude(this.diskWriteUsages.last().value);
            this.status.next(`R: ${read}Bps, W: ${write}Bps`);
        } else {
            this.status.next("- %");
        }
    }
}
