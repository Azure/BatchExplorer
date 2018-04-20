import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Job, JobState } from "app/models";
import { JobService, PinnedEntityService } from "app/services";
import { PatchJobComponent } from "./add";

@Injectable()
export class JobCommands extends EntityCommands<Job> {
    constructor(
        injector: Injector,
        jobService: JobService,
        private pinnedEntityService: PinnedEntityService,
        private sidebarManager: SidebarManager) {
        super(
            injector,
            "Job",
            (jobId) => jobService.get(jobId),
            (jobId) => jobService.getFromCache(jobId),
            [
                new EntityCommand({
                    label: "Edit",
                    action: (job) => this.editJob(job),
                    enabled: (job) => job.state !== JobState.completed,
                    multiple: false,
                    confirm: false,
                }),
                new EntityCommand({
                    label: "Delete",
                    action: (job: Job) => jobService.delete(job.id),
                }),
                new EntityCommand({
                    label: "Terminate",
                    action: (job: Job) => jobService.terminate(job.id),
                    enabled: (job) => job.state !== JobState.completed,
                }),
                new EntityCommand({
                    label: "Enable",
                    action: (job: Job) => jobService.enable(job.id),
                    enabled: (job) => job.state === JobState.disabled,
                }),
                new EntityCommand({
                    label: "Disable",
                    // TODO-TIM handle options??
                    action: (job: Job) => jobService.disable(job.id, "requeue"),
                    enabled: (job) => job.state !== JobState.disabled && job.state !== JobState.completed,
                }),
                new EntityCommand({
                    label: (job: Job) => {
                        return this.pinnedEntityService.isFavorite(job) ? "Unpin favorite" : "Pin to favorites";
                    },
                    action: (job: Job) => this._pinJob(job),
                    confirm: false,
                    multiple: false,
                }),
            ]);
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
}
