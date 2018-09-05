import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { ArmBatchAccount, BatchAccount, BatchApplication } from "app/models";
import { BatchAccountService } from "app/services";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-application-error-display",
    templateUrl: "application-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationErrorDisplayComponent implements OnInit, OnDestroy {
    @Input()
    public application: BatchApplication;

    public get batchAccount() {
        return this._batchAccount;
    }

    private _batchAccount: BatchAccount;
    private _sub: Subscription;

    constructor(
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef,
        private sidebarManager: SidebarManager) {
    }

    public get hasLinkedStorageAccountIssue(): boolean {
        if (!this._batchAccount) {
            return false;
        }
        return !this._batchAccount.autoStorage
            || !this._batchAccount.autoStorage.storageAccountId;
    }

    public ngOnInit() {
        this._sub = this.accountService.currentAccount.subscribe((account) => {
            this._batchAccount = account;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @autobind()
    public setupLinkedStorage() {
        if (this._batchAccount instanceof ArmBatchAccount) {
            const sidebarRef = this.sidebarManager.open("edit-storage-account", EditStorageAccountFormComponent);
            sidebarRef.component.account = this._batchAccount;
        }
    }
}
