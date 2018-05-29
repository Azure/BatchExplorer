import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { TaskService } from "app/services";

@Component({
    selector: "bl-terminate-task-dialog",
    templateUrl: "terminate-task-dialog.html",
})
export class TerminateTaskDialogComponent {
    public jobId: string;
    public taskId: string;

    constructor(
        public dialogRef: MatDialogRef<TerminateTaskDialogComponent>,
        private taskService: TaskService) {
    }

    @autobind()
    public ok() {
        return this.taskService.terminate(this.jobId, this.taskId, {});
    }
}
