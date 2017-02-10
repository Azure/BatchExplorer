import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "core-decorators";

import { SidebarManager } from "app/components/base/sidebar";
import { AccountResource, Application } from "app/models";
import { AccountService } from "app/services";

@Component({
    selector: "bex-application-error-display",
    templateUrl: "application-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationErrorDisplayComponent {
    @Input()
    public application: Application;

    private _batchAccount: AccountResource;

    constructor(
        private accountService: AccountService,
        private sidebarManager: SidebarManager) {

        accountService.currentAccount.subscribe((account) => {
            this._batchAccount = account;
        });
    }

    public get hasLinkedStorageAccountIssue(): boolean {
        if (this._batchAccount && this._batchAccount.properties) {
            return !Boolean(this._batchAccount.properties.autoStorage)
                || !Boolean(this._batchAccount.properties.autoStorage.storageAccountId);
        }

        return false;
    }

    @autobind()
    public setupLinkedStorage() {
        console.error("implement setup linked storage account");
    }
}
