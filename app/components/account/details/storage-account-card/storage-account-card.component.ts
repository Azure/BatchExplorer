import { Component, Input, OnChanges } from "@angular/core";
import { ServerError, autobind } from "@batch-flask/core";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { BatchAccount, StorageAccount } from "app/models";
import { StorageAccountService } from "app/services";

import "./storage-account-card.scss";

@Component({
    selector: "bl-storage-account-card",
    templateUrl: "storage-account-card.html",
})
export class StorageAccountCardComponent implements OnChanges {
    @Input()
    public account: BatchAccount;
    public storageAccountId: string;

    public error: ServerError;
    public storageAccount: StorageAccount;

    constructor(
        private sidebarManager: SidebarManager,
        private storageAccountService: StorageAccountService) {
    }

    public ngOnChanges(changes) {
        if (changes.account) {
            const props = this.account.properties;
            this.storageAccountId = props.autoStorage && props.autoStorage.storageAccountId;
            this.storageAccount = null;
            this._loadStorageAccount();
        }
    }

    @autobind()
    public edit() {
        const sidebarRef = this.sidebarManager.open("edit-storage-account", EditStorageAccountFormComponent);
        sidebarRef.component.account = this.account;
    }

    private _loadStorageAccount() {
        const storageAccountId = this.storageAccountId;
        if (!storageAccountId) {
            return;
        }
        this.storageAccountService.get(storageAccountId).subscribe({
            next: (account) => {
                this.storageAccount = account;
            },
            error: (error: ServerError) => {
                this.error = error;
            },
        });
    }
}
