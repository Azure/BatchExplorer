import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "core-decorators";

import { SidebarManager } from "app/components/base/sidebar";
import { RerunTaskFormComponent } from "app/components/task/action";
import { Task, TaskState } from "app/models";
import { TaskService } from "app/services";
import { DateUtils, ObservableUtils } from "app/utils";

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

    constructor(private taskService: TaskService, private sidebarManager: SidebarManager) {

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

    public get exitCodeMessage(): string {
        if (this.task.didTimeout) {
            const time: any = this.task.constraints && this.task.constraints.maxWallClockTime;
            return `Task timed out after running for ${DateUtils.prettyDuration(time)}`;
        } else {
            return `Task completed with exit code '${this.code}'`;
        }
    }

    @autobind()
    public rerun() {
        return ObservableUtils.queue(
            () => this.taskService.reactivate(this.jobId, this.task.id),
            () => this.taskService.getOnce(this.jobId, this.task.id),
        );
    }

    @autobind()
    public rerunDifferent() {
        const ref = this.sidebarManager.open("rerun-task", RerunTaskFormComponent);
        ref.component.jobId = this.jobId;
        ref.component.patchValue(this.task);
    }
}
