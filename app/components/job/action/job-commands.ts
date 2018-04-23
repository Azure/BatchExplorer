import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Job, JobState } from "app/models";
import { JobService, PinnedEntityService } from "app/services";
import { PatchJobComponent } from "./add";
import { DisableJobCommand } from "./disable";
import { TerminateJobCommand } from "./terminate";

@Injectable()
export class JobCommands extends EntityCommands<Job> {
    constructor(
        injector: Injector,
        private jobService: JobService,
        private pinnedEntityService: PinnedEntityService,
        private sidebarManager: SidebarManager) {
        super(
            injector,
            "Job",
            (jobId) => jobService.get(jobId),
            (jobId) => jobService.getFromCache(jobId),
        );

        this.commands = this._buildCommands();
    }

    public editJob(job: Job) {
        const ref = this.sidebarManager
            .open(`edit-job-${job.id}`, PatchJobComponent);
        ref.component.jobId = job.id;
        ref.component.checkJobStateForPoolPicker(job.state);
        ref.component.setValueFromEntity(job);
    }

    private _pinJob(job: Job) {
        this.pinnedEntityService.pinFavorite(job).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(job);
            }
        });
    }

    private _buildCommands() {
        return [
            new EntityCommand<Job>({
                label: "Edit",
                action: (job) => this.editJob(job),
                enabled: (job) => job.state !== JobState.completed,
                multiple: false,
                confirm: false,
                notify: false,
            }),
            new EntityCommand<Job>({
                label: "Delete",
                action: (job: Job) => this.jobService.delete(job.id),
            }),
            new TerminateJobCommand(this.jobService),
            new EntityCommand<Job>({
                label: "Enable",
                action: (job: Job) => this.jobService.enable(job.id),
                enabled: (job) => job.state === JobState.disabled,
            }),
            new DisableJobCommand(this.jobService, this.dialogService),
            new EntityCommand<Job>({
                label: (job: Job) => {
                    return this.pinnedEntityService.isFavorite(job) ? "Unpin favorite" : "Pin to favorites";
                },
                action: (job: Job) => this._pinJob(job),
                confirm: false,
                multiple: false,
            }),
        ];
    }
}
