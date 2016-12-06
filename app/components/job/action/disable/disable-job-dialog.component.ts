import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

import { JobService } from "app/services";

@Component({
    selector: "bex-disable-job-dialog",
    templateUrl: "disable-job-dialog.html",
})
export class DisableJobDialogComponent {
    public jobId: string;
    public processing: boolean = false;
    public actionDescription: string = "";

    public set taskAction(action: string) {
        this.onChange(action);
        this._taskAction = action;
    }
    public get taskAction() { return this._taskAction; };

    private _hasError: boolean = false;
    private _errorText: string;
    private _taskAction: string = "requeue";

    constructor(
        public dialogRef: MdDialogRef<DisableJobDialogComponent>,
        private jobService: JobService) {
        this.onChange(this.taskAction);
        this.taskAction = "requeue";
    }

    public ok() {
        let options: any = {};
        this.processing = true;

        this.jobService.disable(this.jobId, this.taskAction, options).subscribe({
            error: (error) => {
                const errJson = JSON.stringify(error);
                console.error("error disabling job: ", errJson);

                this._hasError = true;
                this.processing = false;
                this._errorText = error.message && error.message.value
                    ? error.message.value.replace("\n", " ")
                    : "unknown error occurred while disabling the job";
            },
            complete: () => {
                this.processing = false;
                this.dialogRef.close();
            },
        });
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }

    public onChange(action) {
        switch (action) {
            case "requeue":
                this.actionDescription = "Terminate running tasks and requeue them. "
                    + "The tasks will run again when the job is enabled.";
                break;
            case "terminate":
                this.actionDescription = "Terminate running tasks. The tasks will not run again.";
                break;
            case "wait":
                this.actionDescription = "Allow currently running tasks to complete.";
                break;
            default:
                this.actionDescription = "";
                break;
        }
    }
}
