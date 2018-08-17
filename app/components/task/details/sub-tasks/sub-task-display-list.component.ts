import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild,
} from "@angular/core";
import { List } from "immutable";

import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListComponent, QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { SubtaskInformation, TaskState } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";

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

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
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
