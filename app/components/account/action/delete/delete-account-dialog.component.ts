import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

import { autobind } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { AccountService } from "app/services";
import { DeleteAccountTask } from "./delete-account-task";

@Component({
    selector: "bl-delete-account-dialog",
    templateUrl: "delete-account-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent {
    public set accountId(accountId: string) {
        this._accountId = accountId;
        this.changeDetector.detectChanges();
    }
    public get accountId() { return this._accountId; }

    public set accountName(accountName: string) {
        this._accountName = accountName;
        this.changeDetector.detectChanges();
    }
    public get accountName() { return this._accountName; }

    private _accountId: string;
    private _accountName: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
        private accountService: AccountService,
        private taskManager: BackgroundTaskService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyBatchAccount() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteAccountTask(this.accountService, [this.accountId]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }
}
