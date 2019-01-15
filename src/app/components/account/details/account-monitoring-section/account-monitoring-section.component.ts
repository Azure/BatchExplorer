import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ChartType, QuickRanges } from "@batch-flask/ui";
import { ArmBatchAccount, BatchAccount } from "app/models";
import { MonitorChartType } from "app/services";

import "./account-monitoring-section.scss";

@Component({
    selector: "bl-account-monitoring-section",
    templateUrl: "account-monitoring-section.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMonitoringSectionComponent {
    public ChartType = ChartType;
    public chartTypes = Object.values(MonitorChartType);

    @Input() public account: BatchAccount;

    public isArmAccount = true;

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

    public ngOnChange(changes) {
        if (changes.account) {
            this.isArmAccount = this.account instanceof ArmBatchAccount;
        }
    }

    public trackMetric(_: number, value: string) {
        return value;
    }
}
