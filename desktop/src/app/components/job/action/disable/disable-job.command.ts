import { Injector } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { COMMAND_LABEL_ICON, DialogService, EntityCommand, Permission } from "@batch-flask/ui";
import { Job, JobState } from "app/models";
import { JobService } from "app/services";
import { DisableJobDialogComponent } from "./disable-job-dialog.component";

export class DisableJobCommand extends EntityCommand<Job, string> {
    private _dialog: DialogService;

    constructor(injector: Injector) {
        const jobService = injector.get(JobService);

        super(injector, {
            name: "disable",
            ...COMMAND_LABEL_ICON.Disable,
            action: (job: Job, option: string) => jobService.disable(job.id, option),
            enabled: (job) => job.state !== JobState.completed && job.state !== JobState.disabled,
            visible: (job) => job.state !== JobState.completed && job.state !== JobState.disabled,
            confirm: (x) => this._confirmAndGetInfo(x),
            permission: Permission.Write,
        });
        this._dialog = injector.get(DialogService);
    }

    @autobind()
    private _confirmAndGetInfo(entities: Job[]) {
        const dialogRef = this._dialog.open(DisableJobDialogComponent);
        dialogRef.componentInstance.jobs = entities;
        return dialogRef.componentInstance.onSubmit;
    }
}
