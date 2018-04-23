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
    public edit: EntityCommand<Job, void>;
    public delete: EntityCommand<Job, void>;
    public enable: EntityCommand<Job, void>;
    public disable: DisableJobCommand;
    public terminate: TerminateJobCommand;
    public pin: EntityCommand<Job, void>;

    constructor(
        injector: Injector,
        private jobService: JobService,
        private pinnedEntityService: PinnedEntityService,
        private sidebarManager: SidebarManager) {
        super(
            injector,
            "Job",
        );

        this._buildCommands();
    }

    public get(jobId: string) {
        return this.jobService.get(jobId);
    }

    public getFromCache(jobId: string) {
        return this.jobService.getFromCache(jobId);
    }

    private _pinJob(job: Job) {
        this.pinnedEntityService.pinFavorite(job).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(job);
            }
        });
    }

    private _buildCommands() {
        this.disable = this.command(DisableJobCommand);
        this.edit = this.simpleCommand({
            label: "Edit",
            action: (job) => this._editJob(job),
            enabled: (job) => job.state !== JobState.completed,
            multiple: false,
            confirm: false,
            notify: false,
        });
        this.delete = this.simpleCommand({
            label: "Delete",
            action: (job: Job) => this.jobService.delete(job.id),
        });
        this.terminate = this.command(TerminateJobCommand);
        this.enable = this.simpleCommand({
            label: "Enable",
            action: (job: Job) => this.jobService.enable(job.id),
            enabled: (job) => job.state === JobState.disabled,
        });
        this.pin = this.simpleCommand({
            label: (job: Job) => {
                return this.pinnedEntityService.isFavorite(job) ? "Unpin favorite" : "Pin to favorites";
            },
            action: (job: Job) => this._pinJob(job),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.edit,
            this.delete,
            this.terminate,
            this.enable,
            this.disable,
            this.pin,
        ];
    }

    private _editJob(job: Job) {
        const ref = this.sidebarManager
            .open(`edit-job-${job.id}`, PatchJobComponent);
        ref.component.jobId = job.id;
        ref.component.checkJobStateForPoolPicker(job.state);
        ref.component.setValueFromEntity(job);
    }
}
