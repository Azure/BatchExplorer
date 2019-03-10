import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { JobScheduleService } from "app/services";

@Component({
    selector: "bl-terminate-job-schedule-dialog",
    templateUrl: "terminate-job-schedule-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminateJobScheduleDialogComponent {
    public processing: boolean = false;

    public set jobScheduleId(jobScheduleId: string) {
        this._jobScheduleId = jobScheduleId;
        this.changeDetector.detectChanges();
    }
    public get jobScheduleId() { return this._jobScheduleId; }

    private _jobScheduleId: string;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MatDialogRef<TerminateJobScheduleDialogComponent>,
        private jobScheduleService: JobScheduleService,
        private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public ok() {
        return this.jobScheduleService.terminate(this.jobScheduleId);
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }
}
