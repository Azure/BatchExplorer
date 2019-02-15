import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { BatchAccountService } from "app/services";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { AbstractListBaseConfig } from "@batch-flask/ui";
import { BatchAccount } from "app/models";
import { List } from "immutable";
import "./select-account-dialog.scss";

@Component({
    selector: "bl-select-account-dialog",
    templateUrl: "select-account-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAccountDialogComponent implements OnDestroy {
    public accounts: List<BatchAccount>;

    public listConfig: AbstractListBaseConfig = {
        navigable: false,
    };

    private _destroy = new Subject();
    constructor(
        private accountService: BatchAccountService,
        private dialogRef: MatDialogRef<string | null>,
        private changeDetector: ChangeDetectorRef) {

        this.accountService.accounts.pipe(takeUntil(this._destroy)).subscribe((accounts) => {
            this.accounts = accounts;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public pickAccount(accountId: string) {
        this.accountService.selectAccount(accountId);
        this.dialogRef.close(accountId);
    }
}
