import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { BatchAccountService } from "app/services";
import { UsageDetailsService } from "app/services/azure-consumption";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import "./account-cost-card.scss";

@Component({
    selector: "bl-account-cost-card",
    templateUrl: "account-cost-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCostCardComponent implements OnInit, OnDestroy {
    private _destroy = new Subject();

    constructor(
        private usageService: UsageDetailsService,
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this.accountService.currentAccount.pipe(takeUntil(this._destroy)).subscribe(() => {
            this._updateUsages();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    private _updateUsages() {
        this.usageService.getUsage().subscribe((usage) => {
            console.log("Result", usage);
        });
    }
}
