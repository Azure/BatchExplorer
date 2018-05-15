import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

import { autobind } from "@batch-flask/core";
import { ConfirmationDialog } from "@batch-flask/ui/dialogs";
import { AccountResource } from "app/models";

@Component({
    selector: "bl-delete-account-dialog",
    templateUrl: "delete-account-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent extends ConfirmationDialog<string[]> {
    public set accounts(accounts: AccountResource[]) {
        this._accounts = accounts;
        this.changeDetector.detectChanges();
    }
    public get accounts() { return this._accounts; }
    private _accounts: AccountResource[] = [];

    constructor(
        public dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
        private changeDetector: ChangeDetectorRef) {
        super();
    }

    @autobind()
    public ok() {
        this.markAsConfirmed();
    }
}
