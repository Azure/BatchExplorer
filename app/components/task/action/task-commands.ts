import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { Task, TaskState } from "app/models";
import { TaskService } from "app/services";

export interface TaskParams {
    jobId: string;
}

@Injectable()
export class TaskCommands extends EntityCommands<Task, TaskParams> {
    public delete: EntityCommand<Task, void>;
    public terminate: EntityCommand<Task, void>;

    constructor(
        injector: Injector,
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
            label: "Delete",
            action: (task: Task) => this.taskService.delete(this.params.jobId, task.id),
        });
        this.terminate = this.simpleCommand({
            label: "Terminate",
            action: (task) => this.taskService.terminate(this.params.jobId, task.id),
            enabled: (task) => task.state !== TaskState.completed,
        });

        this.commands = [
            this.delete,
            this.terminate,
        ];
    }
}
