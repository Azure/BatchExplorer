import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { SidebarRef } from "../../base/sidebar";
import { Account } from "app/models";
import { AccountService } from "app/services";

@Component({
    selector: "bex-account-create-dialog",
    templateUrl: "account-create-dialog.html",
})

export default class AccountCreateDialogComponent implements OnInit {
    public account: Account;
    public isSaving: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<AccountCreateDialogComponent>,
        private accountService: AccountService) {
    }

    public ngOnInit() {
        this.resetForm();
    }

    public onSubmit() {
        this.isSaving = true;
        this.accountService.add(this.account).subscribe(
            (val) => { this.resetForm(); },
            (error) => { console.error("storeAccount() :: error: ", error); },
            () => {
                this.isSaving = false;
                this.sidebarRef.destroy();
            }
        );
    }

    private resetForm() {
        this.account = new Account("", "", "", "", false);
    }
}
