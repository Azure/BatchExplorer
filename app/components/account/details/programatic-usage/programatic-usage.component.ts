import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { AccountResource } from "app/models";
import { AccountService, ResourceAccessService } from "app/services";

import "./programatic-usage.scss";

@Component({
    selector: "bl-programatic-usage",
    templateUrl: "programatic-usage.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramaticUsageComponent {
    public account: AccountResource;

    public set accountId(accountId: string) {
        const changed = accountId !== this._accountId;
        this._accountId = accountId;
        if (accountId && changed) {
            this._loadDetails();
        }
        this.changeDetector.detectChanges();
    }
    public get accountId() { return this._accountId; }

    private _accountId: string;

    constructor(
        private accountService: AccountService,
        private changeDetector: ChangeDetectorRef) {
    }

    private _loadDetails() {
        this.accountService.get(this.accountId).subscribe((account) => {
            this.account = account;
            this.changeDetector.markForCheck();
        });
    }
}
