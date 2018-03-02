import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DeleteTaskAction } from "app/components/task/action";
import { TaskService } from "app/services";

@Component({
    selector: "bl-delete-task-dialog",
    templateUrl: "delete-task-dialog.html",
})
export class DeleteTaskDialogComponent {
    public jobId: string;
    public taskId: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteTaskDialogComponent>,
        private taskService: TaskService,
        private taskManager: BackgroundTaskService) {
    }

    @autobind()
    public destroyTask() {
        const action = new DeleteTaskAction(this.taskService, this.jobId, [this.taskId]);
        action.startAndWaitAsync(this.taskManager);

        return action.actionDone;
    }
}
