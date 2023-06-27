import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ElectronShell } from "@batch-flask/electron";
import { ApplicationLicense } from "app/models";

@Component({
    selector: "bl-license-eula-dialog",
    templateUrl: "license-eula-dialog.html",
})
export class LicenseEulaDialogComponent {
    public license: ApplicationLicense;

    constructor(
        public dialogRef: MatDialogRef<LicenseEulaDialogComponent>,
        private electronShell: ElectronShell) {
    }

    public get isAutodesk(): boolean {
        return this.license && (this.license.id === "maya"
            || this.license.id === "arnold"
            || this.license.id === "3dsmax");
    }

    public get isVray(): boolean {
        return this.license && (this.license.id === "vray");
    }

    public openLink(link: string) {
        this.electronShell.openExternal(link, {activate: true});
    }
}
