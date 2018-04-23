import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobScheduleService, PinnedEntityService } from "app/services";
import { PatchJobScheduleComponent } from "./add";

@Injectable()
export class JobScheduleCommands extends EntityCommands<JobSchedule> {
    public edit: EntityCommand<JobSchedule, void>;
    public delete: EntityCommand<JobSchedule, void>;
    public enable: EntityCommand<JobSchedule, void>;
    public terminate: EntityCommand<JobSchedule, void>;
    public disable: EntityCommand<JobSchedule, void>;
    public pin: EntityCommand<JobSchedule, void>;

    constructor(
        injector: Injector,
        private jobScheduleService: JobScheduleService,
        private pinnedEntityService: PinnedEntityService,
        private sidebarManager: SidebarManager) {
        super(
            injector,
            "JobSchedule",
        );

        this._buildCommands();
    }

    public get(jobScheduleId: string) {
        return this.jobScheduleService.get(jobScheduleId);
    }

    public getFromCache(jobScheduleId: string) {
        return this.jobScheduleService.getFromCache(jobScheduleId);
    }

    private _pinJobSchedule(jobSchedule: JobSchedule) {
        this.pinnedEntityService.pinFavorite(jobSchedule).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(jobSchedule);
            }
        });
    }

    private _buildCommands() {
        this.edit = this.simpleCommand({
            label: "Edit",
            action: (jobSchedule) => this._editJobSchedule(jobSchedule),
            enabled: (jobSchedule) => jobSchedule.state !== JobScheduleState.completed,
            multiple: false,
            confirm: false,
            notify: false,
        });
        this.delete = this.simpleCommand({
            label: "Delete",
            action: (jobSchedule: JobSchedule) => this.jobScheduleService.delete(jobSchedule.id),
        });
        this.terminate = this.simpleCommand({
            label: "Terminate",
            action: (jobSchedule) => this.jobScheduleService.terminate(jobSchedule.id),
            enabled: (jobSchedule) => jobSchedule.state !== JobScheduleState.completed,
        });
        this.enable = this.simpleCommand({
            label: "Enable",
            action: (jobSchedule: JobSchedule) => this.jobScheduleService.enable(jobSchedule.id),
            enabled: (jobSchedule) => {
                return jobSchedule.state !== JobScheduleState.disabled
                    && jobSchedule.state !== JobScheduleState.completed;
            },
        });
        this.disable = this.simpleCommand({
            label: "Disable",
            action: (jobSchedule: JobSchedule) => this.jobScheduleService.disable(jobSchedule.id),
            enabled: (jobSchedule) => jobSchedule.state === JobScheduleState.disabled,
        });
        this.pin = this.simpleCommand({
            label: (jobSchedule: JobSchedule) => {
                return this.pinnedEntityService.isFavorite(jobSchedule) ? "Unpin favorite" : "Pin to favorites";
            },
            action: (jobSchedule: JobSchedule) => this._pinJobSchedule(jobSchedule),
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

    private _editJobSchedule(jobSchedule: JobSchedule) {
        const ref = this.sidebarManager
            .open(`edit-job-schedule-${jobSchedule.id}`, PatchJobScheduleComponent);
        ref.component.jobScheduleId = jobSchedule.id;
        ref.component.setValueFromEntity(jobSchedule);
    }
}
