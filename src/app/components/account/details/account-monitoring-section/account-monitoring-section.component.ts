import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { QuickRange, TimeRange } from "@batch-flask/ui";
import { ArmBatchAccount, BatchAccount } from "app/models";

import "./account-monitoring-section.scss";

@Component({
    selector: "bl-account-monitoring-section",
    templateUrl: "account-monitoring-section.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMonitoringSectionComponent {
    @Input() public account: BatchAccount;

    public isArmAccount = true;

    public timeRange = new FormControl<TimeRange | QuickRange>(QuickRange.last24h);

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    public ngOnChange(changes) {
        if (changes.account) {
            this.isArmAccount = this.account instanceof ArmBatchAccount;
        }
    }
}
