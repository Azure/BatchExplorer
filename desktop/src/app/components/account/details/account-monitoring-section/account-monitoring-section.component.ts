import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { ChartType, QuickRanges } from "@batch-flask/ui";
import { ArmBatchAccount, BatchAccount } from "app/models";
import { MonitorChartType } from "app/services";

import "./account-monitoring-section.scss";

@Component({
    standalone: false,
    selector: "bl-account-monitoring-section",
    templateUrl: "account-monitoring-section.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMonitoringSectionComponent {
    public ChartType = ChartType;
    public chartTypes = Object.values(MonitorChartType);

    @Input() public account: BatchAccount;

    public isArmAccount = true;

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

    public ngOnChange(changes) {
        if (changes.account) {
            this.isArmAccount = this.account instanceof ArmBatchAccount;
        }
    }

    public trackMetric(_: number, value: string) {
        return value;
    }
}
