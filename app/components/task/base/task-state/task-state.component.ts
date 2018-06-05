import {
    ChangeDetectionStrategy, Component,
    HostBinding, Input, OnChanges, SimpleChanges,
} from "@angular/core";

import { Task, TaskState } from "app/models";

import "./task-state.scss";

@Component({
    selector: "bl-task-state",
    templateUrl: "task-state.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStateComponent implements OnChanges {
    @Input() public task: Task;

    @HostBinding("class.error") public hasError = false;
    @HostBinding("class.success") public isSuccess = false;

    public errorCode: string;
    public errorMessage: string;
    public isWaiting: boolean;

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.task) {
            const info = this.task.executionInfo;
            const failureInfo = info && info.failureInfo;
            const state = this.task.state;
            this.isSuccess = state === TaskState.completed && !failureInfo;
            this.hasError = Boolean(failureInfo);
            this.errorCode = failureInfo && failureInfo.code;
            this.errorMessage = failureInfo && failureInfo.message;
            this.isWaiting = state === TaskState.active || state === TaskState.preparing;
        }
    }
}
