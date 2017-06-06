import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { autobind } from "core-decorators";

import { SidebarManager } from "app/components/base/sidebar";
import { RerunTaskFormComponent } from "app/components/task/action";
import { FailureInfo, Task, TaskState } from "app/models";
import { TaskService } from "app/services";
import { DateUtils, ObservableUtils } from "app/utils";

@Component({
    selector: "bl-task-error-display",
    templateUrl: "task-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskErrorDisplayComponent implements OnChanges {
    @Input()
    public jobId: string;

    @Input()
    public task: Task;

    public hasCompleted: boolean = false;
    public failureInfo: FailureInfo;
    public code: number;
    public hasFailureExitCode: boolean = false;
    public errorMessage: string;

    constructor(
        private taskService: TaskService,
        private sidebarManager: SidebarManager) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.task) {
            const exec = this.task.executionInfo;
            this.failureInfo = exec && exec.failureInfo;
            this.hasCompleted = Boolean(this.task && this.task.state === TaskState.completed);
            this.code = this.task && this.task.executionInfo && this.task.executionInfo.exitCode;
            this.hasFailureExitCode = this.hasCompleted && this.code !== 0;
            this._computeExitCodeMessage();
            console.log({ ...this.task.executionInfo.failureInfo });
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
        ref.component.setValueFromEntity(this.task);
    }

    private _computeExitCodeMessage() {
        if (!this.failureInfo) {
            this.errorMessage = "";
            return;
        }

        if (this.task.didTimeout) {
            const time: any = this.task.constraints && this.task.constraints.maxWallClockTime;
            this.errorMessage = `Task timed out after running for ${DateUtils.prettyDuration(time)}`;
        } else if (this.failureInfo.code === "FailureExitCode") {
            this.errorMessage = `Task completed with exit code '${this.code}'`;
        } else {
            this.errorMessage = this.failureInfo.message;
        }
    }
}
