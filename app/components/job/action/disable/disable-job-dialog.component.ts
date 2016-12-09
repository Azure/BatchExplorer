import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { JobService } from "app/services";

@Component({
    selector: "bex-disable-job-dialog",
    templateUrl: "disable-job-dialog.html",
})
export class DisableJobDialogComponent {
    public jobId: string;
    public actionDescription: string = "";

    public set taskAction(action: string) {
        this.onChange(action);
        this._taskAction = action;
    }
    public get taskAction() { return this._taskAction; };

    private _taskAction: string = "requeue";

    constructor(
        public dialogRef: MdDialogRef<DisableJobDialogComponent>,
        private jobService: JobService) {
        this.onChange(this.taskAction);
        this.taskAction = "requeue";
    }

    @autobind()
    public ok() {
        let options: any = {};
        return this.jobService.disable(this.jobId, this.taskAction, options);
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
