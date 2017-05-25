import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AccountResource } from "app/models";

import "./edit-storage-account-form.scss";

@Component({
    selector: "bl-edit-storage-account-form",
    templateUrl: "edit-storage-account-form.html",
})
export class EditStorageAccountFormComponent {
    public set account(account: AccountResource) {
        this._account = account;
        if (account) {
            const props = account.properties;
            this.storageAccountId.patchValue(props.autoStorage && props.autoStorage.storageAccountId);
        }
    }
    public get account() { return this._account; }

    public storageAccountId = new FormControl();

    private _account: AccountResource;
}
