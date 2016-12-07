import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

import { TaskService } from "app/services";

@Component({
    selector: "bex-terminate-task-dialog",
    templateUrl: "terminate-task-dialog.html",
})
export class TerminateTaskDialogComponent {
    public jobId: string;
    public taskId: string;
    public processing: boolean = false;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<TerminateTaskDialogComponent>,
        private taskService: TaskService) {
    }

    public ok() {
        let options: any = {};
        this.processing = true;

        this.taskService.terminate(this.jobId, this.taskId, options).subscribe(
            null,
            (error) => {
                const errJson = JSON.stringify(error);
                console.error("error terminating task: ", errJson);

                this._hasError = true;
                this.processing = false;
                this._errorText = error.message && error.message.value
                    ? error.message.value.replace("\n", " ")
                    : "unknown error occurred while terminating the task";
            },
            () => {
                this.processing = false;
                this.dialogRef.close();
            },
        );
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }
}
