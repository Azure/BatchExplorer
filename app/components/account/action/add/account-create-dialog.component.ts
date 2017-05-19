import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";

import { SidebarRef } from "app/components/base/sidebar";
import { AccountService } from "app/services";

@Component({
    selector: "bl-account-create-dialog",
    templateUrl: "account-create-dialog.html",
})
export class AccountCreateDialogComponent {
    public isSaving: boolean = false;

    constructor(
        public sidebarRef: SidebarRef<AccountCreateDialogComponent>,
        formBuilder: FormBuilder,
        accountService: AccountService,
        router: Router) {
    }

    public onSubmit() {
        alert("Not supported yet!");
    }
}
