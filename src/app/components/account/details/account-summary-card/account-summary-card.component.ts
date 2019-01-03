import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/ui";
import { ArmBatchAccount, BatchAccount } from "app/models";
import { Constants } from "common";
import { BatchAccountCommands } from "../../action";

import "./account-summary-card.scss";

@Component({
    selector: "bl-account-summary-card",
    templateUrl: "account-summary-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [BatchAccountCommands],
})
export class AccountSummaryCardComponent implements OnChanges {
    @Input() public account: BatchAccount;

    public subscriptionId: string | null;
    public subscriptionName: string | null;
    public resourceGroup: string | null;

    constructor(private shell: ElectronShell, public commands: BatchAccountCommands) {

    }

    @autobind()
    public refresh() {
        return this.commands.get(this.account.id);
    }

    public ngOnChanges(changes) {
        if (changes.account) {
            if (this.account instanceof ArmBatchAccount) {
                const sub = this.account.subscription;
                this.subscriptionId = sub && sub.subscriptionId;
                this.subscriptionName = sub && sub.displayName;
                this.resourceGroup = this.account.resourceGroup;
            } else {
                this.subscriptionId = null;
                this.subscriptionName = null;
                this.resourceGroup = null;
            }
        }
    }

    public get armAccount() {
        return this.account instanceof ArmBatchAccount;
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
