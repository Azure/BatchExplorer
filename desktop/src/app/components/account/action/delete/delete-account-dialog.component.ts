import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";
import { ConfirmationDialog } from "@batch-flask/ui/dialogs";
import { BatchAccount } from "app/models";

@Component({
    selector: "bl-delete-account-dialog",
    templateUrl: "delete-account-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent extends ConfirmationDialog<any> {
    public set accounts(accounts: BatchAccount[]) {
        this._accounts = accounts;
        this.changeDetector.detectChanges();
    }
    public get accounts() { return this._accounts; }
    private _accounts: BatchAccount[] = [];

    constructor(
        public dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
        private changeDetector: ChangeDetectorRef) {
        super();
    }

    @autobind()
    public ok() {
        this.markAsConfirmed();
    }

    public trackAccount(index, account: BatchAccount) {
        return account.id;
    }
}
