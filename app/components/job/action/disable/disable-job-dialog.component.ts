import { JobService } from "../../../../services";
import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bex-disable-job-dialog",
    template: require("./disable-job-dialog.html"),
})

export class DisableJobDialogComponent {
    public jobId: string;
    public processing: boolean = false;
    public taskAction: string = "requeue";
    public actionDescription: string = "";

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<DisableJobDialogComponent>,
        private jobService: JobService) {
        this.onChange(this.taskAction);
    }

    public ok() {
        let options: any = {};
        this.processing = true;

        this.jobService.disable(this.jobId, this.taskAction, options).subscribe(
            null,
            (error) => {
                const errJson = JSON.stringify(error);
                console.error("error disabling job: ", errJson);

                this._hasError = true;
                this.processing = false;
                this._errorText = error.message && error.message.value
                    ? error.message.value.replace("\n", " ")
                    : "unknown error occurred while disabling the job";
            },
            () => {
                this.processing = false;
                this.dialogRef.close();
            }
        );
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
