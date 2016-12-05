import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";

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
        private accountService: AccountService,
        private router: Router) {
    }

    public ngOnInit() {
        this.resetForm();
    }

    public onSubmit() {
        this.isSaving = true;
        const account  = Object.assign({}, this.account);
        this.accountService.add(account).subscribe(
            (val) => { this.resetForm(); },
            (error) => { console.error("storeAccount() :: error: ", error); },
            () => {
                this.isSaving = false;
                this.sidebarRef.destroy();
                this.router.navigate(["/accounts", account.name]);
            }
        );
    }

    private resetForm() {
        this.account = new Account("", "", "", "", false);
    }
}
