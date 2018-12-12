import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ElectronShell } from "@batch-flask/ui";
import { ArmBatchAccount, BatchAccount } from "app/models";
import { Constants } from "common";

import "./account-summary-card.scss";

@Component({
    selector: "bl-account-summary-card",
    templateUrl: "account-summary-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSummaryCardComponent {
    @Input() public account: BatchAccount;

    constructor(private shell: ElectronShell) {

    }

    public get armAccount() {
        return this.account instanceof ArmBatchAccount;
    }

    public get subscriptionId(): string | undefined {
        if (this.account instanceof ArmBatchAccount) {
            const sub = this.account.subscription;
            return sub && sub.subscriptionId;
        } else {
            return undefined;
        }
    }

    public get resourceGroup(): string | undefined {
        if (this.account instanceof ArmBatchAccount) {
            return this.account.resourceGroup;
        } else {
            return undefined;
        }
    }

    public openSubscriptionInPortal() {
        const subscriptionId = this.subscriptionId;
        if (subscriptionId) {
            this.shell.openExternal(Constants.ExternalLinks.subscriptionUrl.format(subscriptionId));
        }
    }

    public openResourceGroupInPortal() {
        const subscriptionId = this.subscriptionId;
        const resourceGroup = this.resourceGroup;
        if (subscriptionId && resourceGroup) {
            this.shell.openExternal(Constants.ExternalLinks.resourceGroupUrl.format(subscriptionId, resourceGroup));
        }
    }
}
