import { Component, Input, OnChanges } from "@angular/core";

import { AccountResource } from "app/models";
import { ComputeService } from "app/services";

import { ComponentUtils } from "app/utils";
import "./account-quotas-card.scss";

@Component({
    selector: "bl-account-quotas-card",
    templateUrl: "account-quotas-card.html",
})
export class AccountQuotasCardComponent implements OnChanges {
    @Input() public account: AccountResource;

    public dedicatedCoreQuota: string;
    public lowPriorityCoreQuota: string;

    constructor(private computeService: ComputeService) { }

    public ngOnChanges(changes) {
        if (changes.account) {
            if (this.account.isBatchManaged) {
                this.dedicatedCoreQuota = this.account.properties.dedicatedCoreQuota.toString();
                this.lowPriorityCoreQuota = this.account.properties.lowPriorityCoreQuota.toString();
            }

            if (ComponentUtils.recordChangedId(changes.account) && !this.account.isBatchManaged) {
                this.dedicatedCoreQuota = "Loading. ";
                this.lowPriorityCoreQuota = "N/A";
                this.computeService.getCoreQuota().subscribe((dedicatedCoreQuota) => {
                    this.dedicatedCoreQuota = dedicatedCoreQuota.toString();
                });
            }
        }
    }
}
