import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { TaskService } from "app/services";
import { DeleteTaskAction } from "./";

@Component({
    selector: "bex-delete-task-dialog",
    templateUrl: "delete-task-dialog.html",
})
export class DeleteTaskDialogComponent {
    public jobId: string;
    public taskId: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteTaskDialogComponent>,
        private taskService: TaskService,
        private taskManager: BackgroundTaskManager) {
    }

    @autobind()
    public destroyTask() {
        const action = new DeleteTaskAction(this.taskService, this.jobId, [this.taskId]);
        action.startAndWaitAsync(this.taskManager);

        return action.actionDone;
    }
}
