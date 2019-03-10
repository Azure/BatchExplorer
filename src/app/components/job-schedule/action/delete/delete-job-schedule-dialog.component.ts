import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { Activity, ActivityService } from "@batch-flask/ui";
import { JobScheduleService } from "app/services";

@Component({
    selector: "bl-delete-job-schedule-dialog",
    templateUrl: "delete-job-schedule-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteJobScheduleDialogComponent {
    public set jobScheduleId(jobScheduleId: string) {
        this._jobScheduleId = jobScheduleId;
        this.changeDetector.detectChanges();
    }
    public get jobScheduleId() { return this._jobScheduleId; }

    private _jobScheduleId: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteJobScheduleDialogComponent>,
        private jobScheduleService: JobScheduleService,
        private activityService: ActivityService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyJobSchedule() {
        const initializer = () => {
            return this.jobScheduleService.delete(this.jobScheduleId);
        };

        const activity = new Activity(`Deleting Job Schedule: '${this.jobScheduleId}'`, initializer);
        this.activityService.exec(activity);
        return activity.done;
    }
}
