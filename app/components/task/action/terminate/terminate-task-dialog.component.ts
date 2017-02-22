import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { TaskService } from "app/services";

@Component({
    selector: "bl-terminate-task-dialog",
    templateUrl: "terminate-task-dialog.html",
})
export class TerminateTaskDialogComponent {
    public jobId: string;
    public taskId: string;

    constructor(
        public dialogRef: MdDialogRef<TerminateTaskDialogComponent>,
        private taskService: TaskService) {
    }

    @autobind()
    public ok() {
        return this.taskService.terminate(this.jobId, this.taskId, {});
    }
}
