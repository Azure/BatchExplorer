import { ChangeDetectionStrategy, Component, Input, ViewChild } from "@angular/core";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent, QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { Task, TaskState } from "app/models";
import { SchedulingErrorDecorator } from "app/models/decorators";
import { DateUtils } from "app/utils";

@Component({
    selector: "bex-task-list-display",
    templateUrl: "task-list-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListDisplayComponent extends ListOrTableBase {
    @Input()
    public quickList: boolean;

    @Input()
    public jobId: string;

    @Input()
    public tasks: List<Task>;

    @Input()
    public status: LoadingStatus;

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    @ViewChild(TableComponent)
    public table: TableComponent;

    public taskStatus(task: Task): QuickListItemStatus {
        if (task.state === TaskState.completed && task.executionInfo.exitCode !== 0) {
            return QuickListItemStatus.warning;
        }
    }

    public taskStatusText(task: Task): string {
        if (task.executionInfo && task.executionInfo.schedulingError) {
            return new SchedulingErrorDecorator(task.executionInfo.schedulingError).summary;
        } else if (task.executionInfo && task.executionInfo.exitCode !== 0) {
            return `Task failed with exitCode:  ${task.executionInfo.exitCode}`;
        }
    }

    public formatDate(date: Date) {
        return DateUtils.prettyDate(date, 7);
    }
}
