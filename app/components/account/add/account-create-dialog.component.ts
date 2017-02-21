import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";

import { AccountService } from "app/services";
import { SidebarRef } from "../../base/sidebar";

@Component({
    selector: "bex-account-create-dialog",
    templateUrl: "account-create-dialog.html",
})
export default class AccountCreateDialogComponent {
    public isSaving: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<AccountCreateDialogComponent>,
        private accountService: AccountService,
        private router: Router) {
    }

    public onSubmit() {
        alert("Not supported yet!");
        // this.isSaving = true;
        // const account  = Object.assign({}, this.account);
        // this.accountService.add(account).subscribe(
        //     (val) => { this.resetForm(); },
        //     (error) => { log.error("storeAccount() :: error: ", error); },
        //     () => {
        //         this.isSaving = false;
        //         this.sidebarRef.destroy();
        //         this.router.navigate(["/accounts", account.id]);
        //     },
        // );
    }
}
