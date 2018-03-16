import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

import { autobind } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DeleteCertificateAction } from "app/components/certificate/action/delete/delete-certificate-action";
import { CertificateService } from "app/services";

@Component({
    selector: "bl-delete-certificate-dialog",
    templateUrl: "delete-certificate-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteCertificateDialogComponent {
    public set certificateThumbprint(certificateThumbprint: string) {
        this._certificateThumbprint = certificateThumbprint;
        this.changeDetector.detectChanges();
    }
    public get certificateThumbprint() { return this._certificateThumbprint; }

    private _certificateThumbprint: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteCertificateDialogComponent>,
        private certificateService: CertificateService,
        private taskManager: BackgroundTaskService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyCertificate() {
        const task = new DeleteCertificateAction(this.certificateService, [this.certificateThumbprint]);
        task.startAndWaitAsync(this.taskManager);
        return task.actionDone;
    }
}
