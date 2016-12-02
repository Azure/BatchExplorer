import { ChangeDetectionStrategy, Component, Input, ViewChild } from "@angular/core";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent, QuickListItemStatus } from "app/components/base/quick-list";
import { SelectableList } from "app/components/base/selectable-list";
import { SubtaskInformation, TaskState } from "app/models";
import { SchedulingErrorDecorator } from "app/models/decorators";

@Component({
    selector: "bex-sub-task-display-list",
    templateUrl: "sub-task-display-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SubTaskDisplayListComponent extends SelectableList {
    @Input()
    public quickList: boolean;

    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    @Input()
    public subTasks: List<SubtaskInformation>;

    @Input()
    public status: LoadingStatus;

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    public taskStatus(task: SubtaskInformation): QuickListItemStatus {
        if (task.state === TaskState.completed && task.exitCode !== 0) {
            return QuickListItemStatus.warning;
        }
    }

    public taskStatusText(task: SubtaskInformation): string {
        if (task.schedulingError) {
            return new SchedulingErrorDecorator(task.schedulingError).summary;
        } else if (task.exitCode !== 0) {
            return `Subtask failed with exitCode:  ${task.exitCode}`;
        }
    }
}
