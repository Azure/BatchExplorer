import { ChangeDetectionStrategy, ChangeDetectorRef, Component, QueryList, ContentChildren } from "@angular/core";

import { MetricsMonitorGraphComponent } from "./metrics-monitor-graph";

import "./metrics-monitor.scss";

@Component({
    selector: "bl-metrics-monitor",
    templateUrl: "metrics-monitor.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsMonitorComponent {
    @ContentChildren(MetricsMonitorGraphComponent) public graphs: QueryList<MetricsMonitorGraphComponent>;

    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
