import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { Subscription } from "rxjs";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { AccountResource } from "app/models";
import { AccountService } from "app/services";

@Component({
    selector: "bl-storage-error-display",
    templateUrl: "storage-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageErrorDisplayComponent implements OnInit, OnDestroy {
    @Input() public noClassic = false;

    public hasAutoStorage: boolean;
    public isClassic: boolean;

    private _batchAccount: AccountResource;
    private _currentAccountSub: Subscription;

    // TODO: make this the default auto storage error display.
    constructor(
        private accountService: AccountService,
        private changeDetector: ChangeDetectorRef,
        private sidebarManager: SidebarManager) {

        this.hasAutoStorage = false;
    }

    public ngOnInit() {
        this._currentAccountSub = this.accountService.currentAccount.subscribe((account) => {
            this._batchAccount = account;
            this.hasAutoStorage = Boolean(this.noClassic ? account.hasArmAutoStorage() : account.autoStorage);
            this.isClassic = !account.hasArmAutoStorage();

            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._currentAccountSub.unsubscribe();
    }

    @autobind()
    public setupLinkedStorage() {
        const sidebarRef = this.sidebarManager.open("edit-storage-account", EditStorageAccountFormComponent);
        sidebarRef.component.account = this._batchAccount;
    }
}
