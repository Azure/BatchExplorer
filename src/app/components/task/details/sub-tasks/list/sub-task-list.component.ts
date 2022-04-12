import {
    ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, Output,
} from "@angular/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { FailureInfoDecorator } from "app/decorators";
import { SubtaskInformation, TaskState } from "app/models";
import { List } from "immutable";

@Component({
    selector: "bl-sub-task-list",
    templateUrl: "sub-task-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubTaskListComponent extends ListBaseComponent {
    @Input() public subTasks: List<SubtaskInformation>;

    @Output() public scrollBottom = new EventEmitter();

    constructor(injector: Injector) {
        super(injector);
    }

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
