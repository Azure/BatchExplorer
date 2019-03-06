import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { JobScheduleService } from "app/services";

@Component({
    selector: "bl-enable-job-schedule-dialog",
    templateUrl: "enable-job-schedule-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnableJobScheduleDialogComponent {
    public jobScheduleId: string;

    constructor(
        public dialogRef: MatDialogRef<EnableJobScheduleDialogComponent>,
        private jobScheduleService: JobScheduleService) {
    }

    @autobind()
    public ok() {
        const options: any = {};

        return this.jobScheduleService.enable(this.jobScheduleId, options);
    }
}
