import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

import { autobind } from "app/core";
import { JobScheduleService } from "app/services";

@Component({
    selector: "bl-enable-job-schedule-dialog",
    templateUrl: "enable-job-schedule-dialog.html",
})
export class EnableJobScheduleDialogComponent {
    public jobScheduleId: string;

    constructor(
        public dialogRef: MatDialogRef<EnableJobScheduleDialogComponent>,
        private jobScheduleService: JobScheduleService) {
    }

    @autobind()
    public ok() {
        let options: any = {};

        return this.jobScheduleService.enable(this.jobScheduleId, options);
    }
}
