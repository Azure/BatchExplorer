import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import * as moment from "moment";

import { Task, TaskState } from "app/models";

@Component({
    selector: "bex-task-lifetime",
    templateUrl: "task-lifetime.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskLifetimeComponent {
    @Input()
    public task: Task;

    public get state() {
        return this.task.state;
    }

    public get doneActive() {
        return this.state !== TaskState.active;
    }

    public get donePreparing() {
        return [TaskState.running, TaskState.completed].includes(this.state);
    }

    public get active() {
        return this.state === TaskState.active;
    }

    public get preparing() {
        return this.state === TaskState.preparing;
    }

    public get running() {
        return this.state === TaskState.running;
    }

    public get completed() {
        return this.state === TaskState.completed;
    }

    public get creationTime() {
        return this._formatDate(this.task.creationTime);
    }

    public get startTime() {
        const info = this.task.executionInfo;
        return this._formatDate(info && info.startTime);
    }

    public get endTime() {
        const info = this.task.executionInfo;
        return this._formatDate(info && info.endTime);
    }

    public get retryCount() {
        const info = this.task.executionInfo;
        console.log("retry count", info);
        return info && info.retryCount;
    }

    /**
     * If the task completed with a warning
     */
    public get completedWarning() {
        if (!this.completed) {
            return false;
        }
        const info = this.task.executionInfo;
        return info ? info.exitCode !== 0 : false;
    }

    public get activeMessage() {
        if (this.active) {
            return "Waiting for an available node to be scheduled";
        } else {
            return "Task was scheduled to a node";
        }
    }

    private _formatDate(date: Date): string {
        return date ? moment(date).format("HH:mm:ss - YYYY/MM/DD") : "NaN";
    }
}
