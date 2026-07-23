import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { ChartType, QuickRanges } from "@batch-flask/ui";
import { MonitorChartType } from "app/services";

import "./account-monitoring-home.scss";

@Component({
    standalone: false,
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

    public settings: UntypedFormGroup;
    public currentRange = QuickRanges.last24h;
    public chartType: ChartType = ChartType.Line;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.settings = new UntypedFormGroup({
            timeRange: new UntypedFormControl(this.currentRange),
            chartType: new UntypedFormControl(this.chartType),
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
