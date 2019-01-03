import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
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

    constructor(private changeDetector: ChangeDetectorRef) {
        this.changeDetector.markForCheck();
    }

    public ngOnChange(changes) {
        if (changes.account) {
            this.isArmAccount = this.account instanceof ArmBatchAccount;
        }
    }
}
