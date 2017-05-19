import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

import { AccountService } from "app/services";

@Component({
    selector: "bl-delete-account-dialog",
    templateUrl: "delete-account-dialog.html",
})
export class DeleteAccountDialogComponent {
    public accountName: string;
    public accountId: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteAccountDialogComponent>,
        accountService: AccountService) {
    }

    public destroyAccount() {
        alert("Not supported yet!");
    }
}
