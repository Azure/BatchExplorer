import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ChartType, QuickRanges } from "@batch-flask/ui";
import { MonitorChartType } from "app/services";

import "./account-monitoring-home.scss";

@Component({
    selector: "bl-account-monitoring-home",
    templateUrl: "account-monitoring-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMonitoringHomeComponent {
    public static breadcrumb(params, queryParams) {
        return { name: "Monitoring" };
    }

    public ChartType = ChartType;

    public chartTypes = Object.values(MonitorChartType);

    public settings: FormGroup;
    public currentRange = QuickRanges.last24h;
    public chartType: ChartType = ChartType.Line;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.settings = new FormGroup({
            timeRange: new FormControl(this.currentRange),
            chartType: new FormControl(this.chartType),
        });
        this.settings.valueChanges.subscribe(({ timeRange, chartType }) => {
            this.currentRange = timeRange;
            this.chartType = chartType;
            this.changeDetector.markForCheck();
        });
    }

    public trackMetric(_: number, value: string) {
        return value;
    }
}
