import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { CertificateService } from "app/services";

@Component({
    selector: "bl-reactivate-certificate-dialog",
    templateUrl: "reactivate-certificate-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactivateCertificateDialogComponent {
    public certificateThumbprint: string;

    constructor(
        public dialogRef: MatDialogRef<ReactivateCertificateDialogComponent>,
        private certificateService: CertificateService) {
    }

    @autobind()
    public ok() {
        const options: any = {};

        return this.certificateService.cancelDelete(this.certificateThumbprint, options);
    }
}
