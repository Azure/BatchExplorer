import { JobService } from "../../../../services";
import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bex-enable-job-dialog",
    template: require("./enable-job-dialog.html"),
})

export class EnableJobDialogComponent {
    public jobId: string;
    public processing: boolean = false;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<EnableJobDialogComponent>,
        private jobService: JobService) {
    }

    public ok() {
        let options: any = {};
        this.processing = true;

        this.jobService.enable(this.jobId, options).subscribe(
            null,
            (error) => {
                const errJson = JSON.stringify(error);
                console.error("error enabling job: ", errJson);

                this._hasError = true;
                this.processing = false;
                this._errorText = error.message && error.message.value
                    ? error.message.value.replace("\n", " ")
                    : "unknown error occurred while enabling the job";
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
}
