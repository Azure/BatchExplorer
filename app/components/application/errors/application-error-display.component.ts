import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "core-decorators";
import { shell } from "electron";

import { SidebarManager } from "app/components/base/sidebar";
import { AccountResource, Application } from "app/models";
import { AccountService } from "app/services";
import { ExternalLinks } from "app/utils/constants";

@Component({
    selector: "bl-application-error-display",
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
            return !this._batchAccount.properties.autoStorage
                || !this._batchAccount.properties.autoStorage.storageAccountId;
        }

        return false;
    }

    @autobind()
    public setupLinkedStorage() {
        shell.openExternal(ExternalLinks.setupStorageAccount.format(this._batchAccount.id));
    }
}
