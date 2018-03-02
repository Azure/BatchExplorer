import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { JobService } from "app/services";

@Component({
    selector: "bl-enable-job-dialog",
    templateUrl: "enable-job-dialog.html",
})
export class EnableJobDialogComponent {
    public jobId: string;

    constructor(
        public dialogRef: MatDialogRef<EnableJobDialogComponent>,
        private jobService: JobService) {
    }

    @autobind()
    public ok() {
        const options: any = {};

        return this.jobService.enable(this.jobId, options);
    }
}
