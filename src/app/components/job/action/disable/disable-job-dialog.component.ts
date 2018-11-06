import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { ConfirmationDialog } from "@batch-flask/ui";
import { Job } from "app/models";

@Component({
    selector: "bl-disable-job-dialog",
    templateUrl: "disable-job-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisableJobDialogComponent extends ConfirmationDialog<string> {
    public set jobs(jobs: Job[]) {
        this._jobs = jobs;
        this.changeDetector.markForCheck();
    }
    public actionDescription: string = "";

    public set taskAction(action: string) {
        this.onChange(action);
        this._taskAction = action;
        this.changeDetector.markForCheck();
    }
    public get taskAction() { return this._taskAction; }

    private _taskAction: string = "requeue";
    private _jobs: Job[] = [];

    constructor(public dialogRef: MatDialogRef<DisableJobDialogComponent>, private changeDetector: ChangeDetectorRef) {
        super();

        this.taskAction = "requeue";
    }

    @autobind()
    public ok() {
        this.markAsConfirmed(this.taskAction);
    }

    public get title() {
        const size = this._jobs.length;
        if (size > 1) {
            return `Are you sure you want to disable ${size} jobs`;
        } else {
            const job = this._jobs.first();
            return `Are you sure you want to disable job ${job && job.id}`;
        }
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
