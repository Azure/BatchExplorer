import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DeleteJobAction } from "app/components/job/action";
import { JobService } from "app/services";

@Component({
    selector: "bl-delete-job-dialog",
    templateUrl: "delete-job-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteJobDialogComponent {
    public set jobId(jobId: string) {
        this._jobId = jobId;
        this.changeDetector.detectChanges();
    }
    public get jobId() { return this._jobId; }

    private _jobId: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteJobDialogComponent>,
        private jobService: JobService,
        private taskManager: BackgroundTaskService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public destroyJob() {
        const task = new DeleteJobAction(this.jobService, [this.jobId]);
        task.startAndWaitAsync(this.taskManager);
        return task.actionDone;
    }
}
