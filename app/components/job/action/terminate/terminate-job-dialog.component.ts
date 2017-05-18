import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { JobService } from "app/services";

@Component({
    selector: "bl-terminate-job-dialog",
    templateUrl: "terminate-job-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminateJobDialogComponent {
    public processing: boolean = false;

    public set jobId(jobId: string) {
        this._jobId = jobId;
        this.changeDetector.detectChanges();
    }
    public get jobId() { return this._jobId; }

    private _jobId: string;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<TerminateJobDialogComponent>,
        private jobService: JobService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public ok() {
        return this.jobService.terminate(this.jobId);
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }
}
