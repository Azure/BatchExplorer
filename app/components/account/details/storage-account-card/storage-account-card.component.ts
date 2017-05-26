import { Component, Input, OnChanges } from "@angular/core";

import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { SidebarManager } from "app/components/base/sidebar";
import { AccountResource, ServerError, StorageAccount } from "app/models";
import { StorageAccountService } from "app/services";

import "./storage-account-card.scss";

@Component({
    selector: "bl-storage-account-card",
    templateUrl: "storage-account-card.html",
})
export class StorageAccountCardComponent implements OnChanges {
    @Input()
    public account: AccountResource;
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

    public edit() {
        const sidebarRef = this.sidebarManager.open("edit-storage-account", EditStorageAccountFormComponent);
        sidebarRef.component.account = this.account;
        this.sidebarManager.onClosed.subscribe(() => {
            // this._loadStorageAccount();
            // TODO
        });
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
