import { Injectable } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { DialogService, EntityCommand } from "@batch-flask/ui";

import { Job, JobState } from "app/models";
import { JobService } from "app/services";
import { DisableJobDialogComponent } from "./disable-job-dialog.component";

@Injectable()
export class DisableJobCommand extends EntityCommand<Job, string> {
    constructor(jobService: JobService, private dialog: DialogService) {
        super({
            label: "Disable",
            action: (job: Job, option: string) => jobService.disable(job.id, option),
            enabled: (job) => job.state !== JobState.completed && job.state !== JobState.disabled,
            confirm: (x) => this._confirmAndGetInfo(x),
        });
    }

    @autobind()
    public _confirmAndGetInfo(entities: Job[]) {
        const dialogRef = this.dialog.open(DisableJobDialogComponent);

        return dialogRef.componentInstance.onSubmit;
    }
}
