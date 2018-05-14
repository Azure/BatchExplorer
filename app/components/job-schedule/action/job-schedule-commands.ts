import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, ElectronRemote, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { JobSchedule, JobScheduleState } from "app/models";
import { FileSystemService, JobScheduleService, PinnedEntityService } from "app/services";
import { Observable } from "rxjs/Observable";
import { JobScheduleCreateBasicDialogComponent, PatchJobScheduleComponent } from "./add";

@Injectable()
export class JobScheduleCommands extends EntityCommands<JobSchedule> {
    public edit: EntityCommand<JobSchedule, void>;
    public delete: EntityCommand<JobSchedule, void>;
    public enable: EntityCommand<JobSchedule, void>;
    public terminate: EntityCommand<JobSchedule, void>;
    public disable: EntityCommand<JobSchedule, void>;
    public clone: EntityCommand<JobSchedule, void>;
    public exportAsJSON: EntityCommand<JobSchedule, void>;
    public pin: EntityCommand<JobSchedule, void>;

    constructor(
        injector: Injector,
        private fs: FileSystemService,
        private remote: ElectronRemote,
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
            ...COMMAND_LABEL_ICON.Edit,
            action: (jobSchedule) => this._editJobSchedule(jobSchedule),
            enabled: (jobSchedule) => jobSchedule.state !== JobScheduleState.completed,
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.delete = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Delete,
            action: (jobSchedule: JobSchedule) => this.jobScheduleService.delete(jobSchedule.id),
            permission: Permission.Write,
        });

        this.terminate = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Terminate,
            action: (jobSchedule) => this.jobScheduleService.terminate(jobSchedule.id),
            enabled: (jobSchedule) => jobSchedule.state !== JobScheduleState.completed,
            permission: Permission.Write,
        });

        this.enable = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Enable,
            action: (jobSchedule: JobSchedule) => this.jobScheduleService.enable(jobSchedule.id),
            enabled: (jobSchedule) => {
                return jobSchedule.state !== JobScheduleState.disabled
                    && jobSchedule.state !== JobScheduleState.completed;
            },
            visible: (jobSchedule) => {
                return jobSchedule.state !== JobScheduleState.disabled
                    && jobSchedule.state !== JobScheduleState.completed;
            },
            permission: Permission.Write,
        });

        this.disable = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Disable,
            action: (jobSchedule: JobSchedule) => this.jobScheduleService.disable(jobSchedule.id),
            enabled: (jobSchedule) => jobSchedule.state === JobScheduleState.disabled,
            visible: (jobSchedule) => jobSchedule.state === JobScheduleState.disabled,
            permission: Permission.Write,
        });

        this.clone = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Clone,
            action: (jobSchedule) => this._cloneJobSchedule(jobSchedule),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.exportAsJSON = this.simpleCommand({
            ...COMMAND_LABEL_ICON.ExportAsJSON,
            action: (jobSchedule) => this._exportAsJSON(jobSchedule),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.pin = this.simpleCommand({
            label: (jobSchedule: JobSchedule) => {
                return this.pinnedEntityService.isFavorite(jobSchedule)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteLabel : COMMAND_LABEL_ICON.PinFavoriteLabel;
            },
            icon: (jobSchedule: JobSchedule) => {
                return this.pinnedEntityService.isFavorite(jobSchedule)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteIcon : COMMAND_LABEL_ICON.PinFavoriteIcon;
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
            this.clone,
            this.exportAsJSON,
            this.pin,
        ];
    }

    private _editJobSchedule(jobSchedule: JobSchedule) {
        const ref = this.sidebarManager
            .open(`edit-job-schedule-${jobSchedule.id}`, PatchJobScheduleComponent);
        ref.component.jobScheduleId = jobSchedule.id;
        ref.component.setValueFromEntity(jobSchedule);
    }

    private _cloneJobSchedule(jobSchedule: JobSchedule) {
        const ref = this.sidebarManager.open(`add-job-schedule-${jobSchedule.id}`,
        JobScheduleCreateBasicDialogComponent);
        ref.component.setValueFromEntity(jobSchedule);
    }

    private _exportAsJSON(jobSchedule: JobSchedule) {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${jobSchedule.id}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(jobSchedule._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
    }
}
