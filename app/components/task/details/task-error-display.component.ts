import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "core-decorators";

import { Task, TaskState } from "app/models";
import { TaskService } from "app/services";

@Component({
    selector: "bex-task-error-display",
    templateUrl: "task-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskErrorDisplayComponent {
    @Input()
    public jobId: string;

    @Input()
    public task: Task;

    constructor(private taskService: TaskService) {

    }

    public get hasCompleted(): Boolean {
        return Boolean(this.task && this.task.state === TaskState.completed);
    }

    public get code() {
        return this.task && this.task.executionInfo && this.task.executionInfo.exitCode;
    }

    public get hasFailureExitCode(): boolean {
        return this.hasCompleted && this.code !== 0;
    }

    @autobind()
    public rerun() {
        return this.taskService.reactivate(this.jobId, this.task.id);
    }

    @autobind()
    public rerunDifferent() {

    }
}
