import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

import { autobind } from "app/core";
import { JobScheduleService } from "app/services";

@Component({
    selector: "bl-disable-job-schedule-dialog",
    templateUrl: "disable-job-schedule-dialog.html",
})
export class DisableJobScheduleDialogComponent {
    public jobScheduleId: string;
    public actionDescription: string = "";

    constructor(
        public dialogRef: MatDialogRef<DisableJobScheduleDialogComponent>,
        private jobScheduleService: JobScheduleService) {
    }

    @autobind()
    public ok() {
        let options: any = {};
        return this.jobScheduleService.disable(this.jobScheduleId, options);
    }
}
