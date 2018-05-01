import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, EventEmitter, Input, OnChanges, Output,
} from "@angular/core";
import { List } from "immutable";

import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { TaskCommands } from "app/components/task/action";
import { Task, TaskState } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";
import { DateUtils } from "app/utils";

@Component({
    selector: "bl-task-list-display",
    templateUrl: "task-list-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TaskCommands],
})
export class TaskListDisplayComponent extends ListBaseComponent implements OnChanges {
    @Input() public jobId: string;

    @Input() public tasks: List<Task>;

    @Input() public status: LoadingStatus;

    @Output() public scrollBottom = new EventEmitter();

    constructor(public commands: TaskCommands, changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public ngOnChanges(changes) {
        if (changes.jobId) {
            this.commands.params = { jobId: this.jobId };
        }
    }
    public taskStatus(task: Task): QuickListItemStatus {
        if (task.state === TaskState.completed && task.executionInfo.exitCode !== 0) {
            return QuickListItemStatus.warning;
        }
    }

    public taskStatusText(task: Task): string {
        if (task.executionInfo && task.executionInfo.failureInfo) {
            return new FailureInfoDecorator(task.executionInfo.failureInfo).summary;
        } else if (task.executionInfo && task.executionInfo.exitCode !== 0) {
            return `Task failed with exitCode:  ${task.executionInfo.exitCode}`;
        }
    }

    public formatDate(date: Date) {
        return DateUtils.prettyDate(date, 7);
    }

    public trackByFn(index, task: Task) {
        return task.id;
    }
}
