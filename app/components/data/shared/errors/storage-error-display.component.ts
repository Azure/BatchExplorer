import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { SidebarManager } from "app/components/base/sidebar";
import { AccountResource } from "app/models";
import { AccountService, StorageService } from "app/services";

@Component({
    selector: "bl-storage-error-display",
    templateUrl: "storage-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageErrorDisplayComponent implements OnInit, OnDestroy {
    public hasAutoStorage: boolean;

    private _autoStorageSub: Subscription;
    private _batchAccount: AccountResource;
    private _currentAccountSub: Subscription;

    // TODO: make this the default auto storage error display.
    constructor(
        private accountService: AccountService,
        private storageService: StorageService,
        private changeDetector: ChangeDetectorRef,
        private sidebarManager: SidebarManager) {

        this.hasAutoStorage = false;
        this._autoStorageSub = this.storageService.hasAutoStorage.subscribe((hasAutoStorage) => {
            this.hasAutoStorage = hasAutoStorage;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this._currentAccountSub = this.accountService.currentAccount.subscribe((account) => {
            this._batchAccount = account;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._autoStorageSub.unsubscribe();
        this._currentAccountSub.unsubscribe();
    }

    @autobind()
    public setupLinkedStorage() {
        const sidebarRef = this.sidebarManager.open("edit-storage-account", EditStorageAccountFormComponent);
        sidebarRef.component.account = this._batchAccount;
    }
}
