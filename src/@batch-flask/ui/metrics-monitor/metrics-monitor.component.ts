import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, QueryList,
} from "@angular/core";

import { MetricsMonitorGraphComponent } from "./metrics-monitor-metric";

import "./metrics-monitor.scss";

@Component({
    selector: "bl-metrics-monitor",
    templateUrl: "metrics-monitor.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsMonitorComponent implements AfterContentInit {
    @ContentChildren(MetricsMonitorGraphComponent) public graphs: QueryList<MetricsMonitorGraphComponent>;

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngAfterContentInit() {
        this.graphs.changes.subscribe(() => this.changeDetector.markForCheck());
    }

    public trackMetric(index, metric: MetricsMonitorGraphComponent) {
        return index;
    }
}
