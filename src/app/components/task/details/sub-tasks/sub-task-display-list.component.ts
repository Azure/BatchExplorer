import {
    ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, Output, ViewChild,
} from "@angular/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListComponent, QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { FailureInfoDecorator } from "app/decorators";
import { SubtaskInformation, TaskState } from "app/models";
import { List } from "immutable";

@Component({
    selector: "bl-sub-task-display-list",
    templateUrl: "sub-task-display-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SubTaskDisplayListComponent extends ListBaseComponent {
    @Input() public jobId: string;

    @Input() public taskId: string;

    @Input() public subTasks: List<SubtaskInformation>;

    @Input() public status: LoadingStatus;

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

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
