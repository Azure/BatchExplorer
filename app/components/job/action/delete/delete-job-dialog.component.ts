import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { DeleteJobAction } from "app/components/job/action";
import { JobService } from "app/services";

@Component({
    selector: "bl-delete-job-dialog",
    templateUrl: "delete-job-dialog.html",
})
export class DeleteJobDialogComponent {
    public jobId: string;
    public processing: boolean = false;

    constructor(
        public dialogRef: MdDialogRef<DeleteJobDialogComponent>,
        private jobService: JobService,
        private taskManager: BackgroundTaskManager) {
    }

    @autobind()
    public destroyJob() {
        const task = new DeleteJobAction(this.jobService, [this.jobId]);
        task.startAndWaitAsync(this.taskManager);
        return task.actionDone;
    }
}
