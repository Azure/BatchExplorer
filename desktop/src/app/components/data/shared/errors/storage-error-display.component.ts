import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { ArmBatchAccount, BatchAccount } from "app/models";
import { BatchAccountService } from "app/services";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "bl-storage-error-display",
    templateUrl: "storage-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageErrorDisplayComponent implements OnInit, OnDestroy {
    @Input() public noClassic = false;

    public hasAutoStorage: boolean = true;
    public isClassic: boolean;
    public hasError: boolean = false;

    private _batchAccount: BatchAccount;
    private _destroy = new Subject();

    constructor(
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef,
        private sidebarManager: SidebarManager) {
    }

    public ngOnInit() {
        this.accountService.currentAccount.pipe(takeUntil(this._destroy)).subscribe((account) => {
            this._batchAccount = account;
            this.hasAutoStorage = Boolean(account.autoStorage);
            this.isClassic = this.hasAutoStorage && !account.hasArmAutoStorage();
            if (this.noClassic) {
                this.hasError = !this.hasAutoStorage || this.isClassic;
            } else {
                this.hasError = !this.hasAutoStorage;
            }
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    @autobind()
    public setupLinkedStorage() {
        if (this._batchAccount instanceof ArmBatchAccount) {
            const sidebarRef = this.sidebarManager.open("edit-storage-account", EditStorageAccountFormComponent);
            sidebarRef.component.account = this._batchAccount;
        }
    }
}
