import { Injectable, Injector } from "@angular/core";

import {
    COMMAND_LABEL_ICON, ElectronRemote, EntityCommand,
    EntityCommands, FileSystemService, Permission, SidebarManager,
} from "@batch-flask/ui";
import { Task, TaskState } from "app/models";
import { TaskService } from "app/services";
import { from } from "rxjs";
import { TaskCreateBasicDialogComponent } from "../action";

export interface TaskParams {
    jobId: string;
}

@Injectable()
export class TaskCommands extends EntityCommands<Task, TaskParams> {
    public delete: EntityCommand<Task, void>;
    public terminate: EntityCommand<Task, void>;
    public clone: EntityCommand<Task, void>;
    public exportAsJSON: EntityCommand<Task, void>;

    constructor(
        injector: Injector,
        private sidebarManager: SidebarManager,
        private fs: FileSystemService,
        private remote: ElectronRemote,
        private taskService: TaskService) {
        super(
            injector,
            "Task",
        );

        this._buildCommands();
    }

    public get(taskId: string) {
        return this.taskService.get(this.params.jobId, taskId);
    }

    public getFromCache(taskId: string) {
        return this.taskService.getFromCache(this.params.jobId, taskId);
    }

    private _buildCommands() {
        this.delete = this.simpleCommand({
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (task: Task) => this._deleteTask(task),
            permission: Permission.Write,
        });

        this.terminate = this.simpleCommand({
            name: "terminate",
            ...COMMAND_LABEL_ICON.Terminate,
            action: (task) => this.taskService.terminate(this.params.jobId, task.id),
            enabled: (task) => task.state !== TaskState.completed,
        });

        this.clone = this.simpleCommand({
            name: "clone",
            ...COMMAND_LABEL_ICON.Clone,
            action: (task) => this._cloneTask(task),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.exportAsJSON = this.simpleCommand({
            name: "exportAsJSON",
            ...COMMAND_LABEL_ICON.ExportAsJSON,
            action: (task) => this._exportAsJSON(task),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.commands = [
            this.delete,
            this.terminate,
            this.clone,
            this.exportAsJSON,
        ];
    }

    private _deleteTask(task: Task) {
        return this.taskService.delete(this.params.jobId, task.id);
    }

    private _cloneTask(task: Task) {
        const ref = this.sidebarManager.open(`add-task-${task.id}`, TaskCreateBasicDialogComponent);
        ref.component.jobId = this.params.jobId;
        ref.component.setValueFromEntity(task);
    }

    private _exportAsJSON(task: Task) {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${this.params.jobId}.${task.id}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(task._original, null, 2);
            return from(this.fs.saveFile(localPath, content));
        }
    }
}
