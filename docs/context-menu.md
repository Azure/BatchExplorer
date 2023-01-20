# Context menu

You can add a context menu on right click(or any other trigger if needed).

Example of usage.

```typescript

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";

@Component({
    template: `<div (contextmenu)="onContextMenu()"></div>`
})
export class MyComponent {
    constructor(private contextMenuService: ContextMenuService) {}

    public onContextMenu() {
        contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Delete", () => console.log("Delete")),
            new ContextMenuItem("Terminate", () => console.log("Terminate")),
            new ContextMenuItem({label: "Enable", click: () => console.log("Enable"), enable: false}),
        ]));
    }
}
```

## Context menu in quick list or table

Table and quicklist support the context menu you just have to pass the menu as input to the quick list item/row.

In the template

```html
    <bl-quick-list [commands]="commands">
        ...
    </bl-quick-list>
    <bl-table [commands]="commands">
        ...
    </bl-table>
```

In the model

```typescript
    constructor(public commands: JobCommands) {
    }
```

In `job-commands.ts`

```ts
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
            ...COMMAND_LABEL_ICON.Edit,
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
            ...COMMAND_LABEL_ICON.Clone,
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
            ...COMMAND_LABEL_ICON.Enable,
            action: (job: Job) => this.jobService.enable(job.id),
            enabled: (job: Job) => job.state === JobState.disabled,
            visible: (job: Job) => job.state === JobState.disabled,
            permission: Permission.Write,
        });

        this.createJobSchedule = this.simpleCommand({
            ...COMMAND_LABEL_ICON.CreateJobScheduleForJobs,
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
                return this.pinnedEntityService.isFavorite(job)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteLabel : COMMAND_LABEL_ICON.PinFavoriteLabel;
            },
            icon: (job: Job) => {
                return this.pinnedEntityService.isFavorite(job)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteIcon : COMMAND_LABEL_ICON.PinFavoriteIcon;
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
        const createRef = this.sidebarManager.open("add-task", AddTaskFormComponent);
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
            return from(this.fs.saveFile(localPath, content));
        }
    }
}
```
