import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { TaskService } from "app/services";
import { DeleteTaskAction } from "./";

@Component({
    selector: "bex-delete-task-dialog",
    template: require("./delete-task-dialog.html"),
})

export class DeleteTaskDialogComponent {
    public jobId: string;
    public taskId: string;
    public processing: boolean = false;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteTaskDialogComponent>,
        private taskService: TaskService,
        private taskManager: BackgroundTaskManager) {
    }

    @autobind()
    public destroyTask() {
        const action = new DeleteTaskAction(this.taskService, this.jobId, [this.taskId]);
        action.startAndWaitAsync(this.taskManager);
        action.actionDone.subscribe({
            error: (error) => {
                const errJson = JSON.stringify(error);
                console.error("error deleting task: ", errJson);

                this._hasError = true;
                this.processing = false;
                this._errorText = error.message && error.message.value
                    ? error.message.value.replace("\n", " ")
                    : "unknown error occurred while deleting the task";
            },
            complete: () => {
                // Close after 500ms so we can see the animation
                setTimeout(() => {
                    this.dialogRef.close({ jobId: this.jobId, taskId: this.taskId });
                }, 500);
            },
        });

        return action.actionDone;
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }
}
