import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bl-license-eula-dialog",
    templateUrl: "license-eula-dialog.html",
})
export class LicenseEulaDialogComponent {
    public licenseName: string;

    constructor(
        public dialogRef: MdDialogRef<LicenseEulaDialogComponent>) {
    }
}
