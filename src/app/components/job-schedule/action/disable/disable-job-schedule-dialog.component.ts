import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";
import { JobScheduleService } from "app/services";

@Component({
    selector: "bl-disable-job-schedule-dialog",
    templateUrl: "disable-job-schedule-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        const options: any = {};
        return this.jobScheduleService.disable(this.jobScheduleId, options);
    }
}
