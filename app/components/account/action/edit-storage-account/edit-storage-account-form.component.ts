import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { ArmBatchAccount } from "app/models";
import { AccountPatchDto } from "app/models/dtos";
import { ArmBatchAccountService } from "app/services";
import { Observable } from "rxjs";

import "./edit-storage-account-form.scss";

@Component({
    selector: "bl-edit-storage-account-form",
    templateUrl: "edit-storage-account-form.html",
})
export class EditStorageAccountFormComponent {
    public set account(account: ArmBatchAccount) {
        this._account = account;
        if (account) {
            const props = account.properties;
            this.storageAccountId.patchValue(props.autoStorage && props.autoStorage.storageAccountId);
        }
    }
    public get account() { return this._account; }

    public storageAccountId = new FormControl();

    private _account: ArmBatchAccount;

    constructor(
        private accountService: ArmBatchAccountService,
        public sidebarRef: SidebarRef<EditStorageAccountFormComponent>,
    ) { }

    @autobind()
    public submit(): Observable<any> {
        const dto = new AccountPatchDto({ autoStorage: { storageAccountId: this.storageAccountId.value } });
        const obs = this.accountService.patch(this.account.id, dto);
        obs.subscribe(() => {
            this.accountService.get(this.account.id);
        });
        return obs;
    }
}
