import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { ApplicationService } from "app/services";

@Component({
    selector: "bl-activate-package-dialog",
    templateUrl: "activate-package-dialog.html",
})
export class ActivatePackageDialogComponent {
    public applicationId: string;
    public packageVersion: string;

    constructor(
        public dialogRef: MatDialogRef<ActivatePackageDialogComponent>,
        private applicationService: ApplicationService) {
    }

    @autobind()
    public ok() {
        return this.applicationService.activatePackage(this.applicationId, this.packageVersion);
    }
}
