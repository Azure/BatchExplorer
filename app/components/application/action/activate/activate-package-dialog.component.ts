import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { ApplicationService } from "app/services";

@Component({
    selector: "bl-activate-package-dialog",
    templateUrl: "activate-package-dialog.html",
})
export class ActivatePackageDialogComponent {
    public applicationId: string;
    public packageVersion: string;

    constructor(
        public dialogRef: MdDialogRef<ActivatePackageDialogComponent>,
        private applicationService: ApplicationService) {
    }

    @autobind()
    public ok() {
        return this.applicationService.activatePackage(this.applicationId, this.packageVersion);
    }
}
