import { Component, Input, OnChanges } from "@angular/core";
import {Subscription} from "rxjs";

import { HistoryItem } from "app/components/pool/graphs/history-data/history-data-base";
import { PerformanceData } from "app/components/pool/graphs/performance-graph";
import "./performance-graph.scss";

export enum BatchUsageMetrics {
    cpu,
    memory,
    disk,
    network,
}
@Component({
    selector: "bl-performance-graph",
    templateUrl: "performance-graph.html",
})
export class PerformanceGraphComponent implements OnChanges {
    @Input() public data: PerformanceData;
    @Input() public metricName = "Cpu usage";

    public history: HistoryItem[] = [];
    private _metricSub: Subscription;

    public ngOnChanges(changes) {
        if (changes.data || changes.metricName) {
            this._clearMetricSub();
            this._metricSub = this.data.observeMetric(this.metricName).subscribe((history) => {
                console.log("Got nistor", history);
                this.history = history;
            });
        }
    }

    private _clearMetricSub() {
        if (this._metricSub) {
            this._metricSub.unsubscribe();
        }
        this._metricSub = null;
    }
}
