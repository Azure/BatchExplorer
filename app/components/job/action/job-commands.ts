import { Injectable, Injector } from "@angular/core";
import { COMMAND_LABEL_ICON, ElectronRemote, EntityCommand, EntityCommands, Permission } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Job, JobSchedule, JobState } from "app/models";
import { FileSystemService, JobService, PinnedEntityService } from "app/services";
import { Observable } from "rxjs/Observable";
import { JobScheduleCreateBasicDialogComponent } from "../../job-schedule/action";
import { TaskCreateBasicDialogComponent } from "../../task/action";
import { JobCreateBasicDialogComponent, PatchJobComponent } from "./add";
import { DisableJobCommand } from "./disable";
import { TerminateJobCommand } from "./terminate";

@Injectable()
export class JobCommands extends EntityCommands<Job> {
    public edit: EntityCommand<Job, void>;
    public addTask: EntityCommand<Job, void>;
    public clone: EntityCommand<Job, void>;
    public createJobSchedule: EntityCommand<Job, void>;
    public exportAsJSON: EntityCommand<Job, void>;
    public delete: EntityCommand<Job, void>;
    public enable: EntityCommand<Job, void>;
    public disable: DisableJobCommand;
    public terminate: TerminateJobCommand;
    public pin: EntityCommand<Job, void>;

    constructor(
        injector: Injector,
        private jobService: JobService,
        private fs: FileSystemService,
        private remote: ElectronRemote,
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
            icon: "fa fa-edit",
            action: (job) => this._editJob(job),
            enabled: (job) => job.state !== JobState.completed,
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.addTask = this.simpleCommand({
            ...COMMAND_LABEL_ICON.AddTask,
            action: (job) => this._addTask(job),
            multiple: false,
            confirm: false,
            notify: false,
            enabled: (job) =>  job.state !== JobState.completed
                && job.state !== JobState.deleting
                && job.state !== JobState.terminating,
            permission: Permission.Write,
        });

        this.clone = this.simpleCommand({
            label: "Clone",
            icon: "fa fa-clone",
            action: (job) => this._cloneJob(job),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.delete = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Delete,
            action: (job: Job) => this.jobService.delete(job.id),
            enabled: (job: Job) => job.state !== JobState.deleting && job.state !== JobState.terminating,
            permission: Permission.Write,
        });

        this.terminate = this.command(TerminateJobCommand);

        this.enable = this.simpleCommand({
            label: "Enable",
            icon: "fa fa-play",
            action: (job: Job) => this.jobService.enable(job.id),
            enabled: (job: Job) => job.state === JobState.disabled,
            visible: (job: Job) => job.state === JobState.disabled,
            permission: Permission.Write,
        });

        this.createJobSchedule = this.simpleCommand({
            label: "Create job schedule for this job",
            icon: "fa fa-calendar",
            action: (job) => this._createJobSchedule(job),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.exportAsJSON = this.simpleCommand({
            ...COMMAND_LABEL_ICON.ExportAsJSON,
            action: (job) => this._exportAsJSON(job),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.pin = this.simpleCommand({
            label: (job: Job) => {
                return this.pinnedEntityService.isFavorite(job) ? "Unpin favorite" : "Pin to favorites";
            },
            icon: (job: Job) => {
                return this.pinnedEntityService.isFavorite(job) ? "fa fa-chain-broken" : "fa fa-link";
            },
            action: (job: Job) => this._pinJob(job),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.edit,
            this.addTask,
            this.delete,
            this.terminate,
            this.enable,
            this.disable,
            this.clone,
            this.exportAsJSON,
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

    private _addTask(job: Job) {
        const createRef = this.sidebarManager.open("add-task", TaskCreateBasicDialogComponent);
        createRef.component.jobId = job.id;
    }

    private _cloneJob(job: Job) {
        const ref = this.sidebarManager.open(`add-job-${job.id}`, JobCreateBasicDialogComponent);
        ref.component.setValueFromEntity(job);
    }

    private _createJobSchedule(job: Job) {
        const ref = this.sidebarManager.open(`add-job-schedule`,
        JobScheduleCreateBasicDialogComponent);
        ref.component.setValueFromEntity(new JobSchedule({
            jobSpecification: job.toJS(),
        }));
    }

    private _exportAsJSON(job: Job) {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${job.id}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(job._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
    }
}
