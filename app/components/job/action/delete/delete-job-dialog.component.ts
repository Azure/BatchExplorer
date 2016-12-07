import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { JobService } from "app/services";
import { DeleteJobAction } from "./";

@Component({
    selector: "bex-delete-job-dialog",
    template: require("./delete-job-dialog.html"),
})

export class DeleteJobDialogComponent {
    public jobId: string;
    public processing: boolean = false;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteJobDialogComponent>,
        private jobService: JobService,
        private taskManager: BackgroundTaskManager) {
    }

    @autobind()
    public destroyJob() {
        const task = new DeleteJobAction(this.jobService, [this.jobId]);
        task.startAndWaitAsync(this.taskManager);
        task.actionDone.subscribe({
            error: (error) => {
                const errJson = JSON.stringify(error);
                console.error("error deleting job: ", errJson);

                this._hasError = true;
                this.processing = false;
                this._errorText = error.message && error.message.value
                    ? error.message.value.replace("\n", " ")
                    : "unknown error occurred while deleting the job";
            },
            complete: () => {
                // Close after 500ms so we can see the animation
                setTimeout(() => {
                    this.dialogRef.close(this.jobId);
                }, 500);
            },
        });
        return task.actionDone;
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }
}
