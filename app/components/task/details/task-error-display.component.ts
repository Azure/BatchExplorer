import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { autobind } from "core-decorators";

import { Task, TaskState } from "app/models";
import { AccountService, PoolService } from "app/services";
import { ExternalLinks } from "app/utils/constants";

@Component({
    selector: "bex-pool-error-display",
    templateUrl: "pool-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskErrorDisplayComponent {
    @Input()
    public task: Task;

    constructor(private poolService: PoolService, private accountService: AccountService) {

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

    }

    @autobind()
    public rerunDifferent() {

    }
}
