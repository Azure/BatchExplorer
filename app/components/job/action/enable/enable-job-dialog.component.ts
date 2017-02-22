import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { JobService } from "app/services";

@Component({
    selector: "bl-enable-job-dialog",
    templateUrl: "enable-job-dialog.html",
})
export class EnableJobDialogComponent {
    public jobId: string;

    constructor(
        public dialogRef: MdDialogRef<EnableJobDialogComponent>,
        private jobService: JobService) {
    }

    @autobind()
    public ok() {
        let options: any = {};

        return this.jobService.enable(this.jobId, options);
    }
}
