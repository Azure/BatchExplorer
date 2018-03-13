import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from "@angular/core";

import "./metrics-monitor-graph.scss";

@Component({
    selector: "bl-metrics-monitor-graph",
    templateUrl: "metrics-monitor-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsMonitorGraphComponent {
    @Input() public label: string;

    @ViewChild("preview") public preview: TemplateRef<any>;
    @ViewChild("chart") public chart: TemplateRef<any>;
}
