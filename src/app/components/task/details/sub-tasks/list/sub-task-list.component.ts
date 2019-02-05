import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output,
} from "@angular/core";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { FailureInfoDecorator } from "app/decorators";
import { SubtaskInformation, TaskState } from "app/models";
import { List } from "immutable";

@Component({
    selector: "bl-sub-task-list",
    templateUrl: "sub-task-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubTaskListComponent {
    @Input() public subTasks: List<SubtaskInformation>;

    @Input() public status: LoadingStatus;

    @Output() public scrollBottom = new EventEmitter();

    public taskStatus(task: SubtaskInformation): QuickListItemStatus {
        if (task.state === TaskState.completed && task.exitCode !== 0) {
            return QuickListItemStatus.warning;
        }
    }

    public taskStatusText(task: SubtaskInformation): string {
        if (task.failureInfo) {
            return new FailureInfoDecorator(task.failureInfo).summary;
        } else if (task.exitCode !== 0) {
            return `Subtask failed with exitCode:  ${task.exitCode}`;
        }
    }
}
