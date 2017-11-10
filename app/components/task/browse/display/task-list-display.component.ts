import { ChangeDetectionStrategy, Component, Input, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material";
import { List } from "immutable";

import { ContextMenu, ContextMenuItem } from "app/components/base/context-menu";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent, QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { DeleteTaskDialogComponent, TerminateTaskDialogComponent } from "app/components/task/action";
import { Task, TaskState } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";
import { TaskService } from "app/services";
import { DateUtils } from "app/utils";

@Component({
    selector: "bl-task-list-display",
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

    constructor(private taskService: TaskService, dialog: MatDialog) { super(dialog); }

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

    public deleteTask(task: Task) {
        const dialogRef = this.dialog.open(DeleteTaskDialogComponent);
        dialogRef.componentInstance.jobId = this.jobId;
        dialogRef.componentInstance.taskId = task.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.taskService.get(this.jobId, task.id);
        });
    }

    public terminateTask(task: Task) {
        const dialogRef = this.dialog.open(TerminateTaskDialogComponent);
        dialogRef.componentInstance.jobId = this.jobId;
        dialogRef.componentInstance.taskId = task.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.taskService.get(this.jobId, task.id);
        });
    }

    public contextmenu(task: Task) {
        const isCompleted = task.state === TaskState.completed;
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => this.deleteTask(task) }),
            new ContextMenuItem({ label: "Terminate", click: () => this.terminateTask(task), enabled: !isCompleted }),
        ]);
    }

    public trackByFn(index, task: Task) {
        return task.id;
    }
}
