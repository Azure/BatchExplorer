import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from "@angular/core";

import "./metrics-monitor-metric.scss";

@Component({
    selector: "bl-metrics-monitor-metric",
    templateUrl: "metrics-monitor-metric.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsMonitorGraphComponent {
    @Input() public label: string;

    @ViewChild("preview") public preview: TemplateRef<any>;
    @ViewChild("chart") public chart: TemplateRef<any>;
}
