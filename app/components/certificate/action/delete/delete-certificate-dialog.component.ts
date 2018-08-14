import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

import { autobind } from "@batch-flask/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { WaitForDeletePoller } from "app/components/core/pollers";
import { CertificateService } from "app/services";
import { flatMap } from "rxjs/operators";

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
        private activityService: ActivityService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyCertificate() {
        const initializer = () => {
            return this.certificateService.delete(this.certificateThumbprint).pipe(
                flatMap(obs => {
                    const poller = new WaitForDeletePoller(() => {
                        return this.certificateService.get(this.certificateThumbprint);
                    });
                    return poller.start();
                }),
            );
        };

        const name = `Deleting Certificate ${this.certificateThumbprint}`;
        const activity = new Activity(name, initializer);
        this.activityService.loadAndRun(activity);
        return activity.done;
    }
}
