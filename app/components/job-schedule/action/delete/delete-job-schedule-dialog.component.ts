import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

import { autobind } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DeleteJobScheduleAction } from "app/components/job-schedule/action";
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
        private taskManager: BackgroundTaskService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyJobSchedule() {
        const task = new DeleteJobScheduleAction(this.jobScheduleService, [this.jobScheduleId]);
        task.startAndWaitAsync(this.taskManager);
        return task.actionDone;
    }
}
