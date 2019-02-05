import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges,
} from "@angular/core";
import { ListView, autobind } from "@batch-flask/core";
import { SubtaskInformation } from "app/models";
import { SubtaskListParams, TaskService } from "app/services";
import { List } from "immutable";
import { Observable } from "rxjs";

import "./sub-tasks-browser.scss";

@Component({
    selector: "bl-sub-tasks-browser",
    templateUrl: "sub-tasks-browser.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskSubTasksBrowserComponent implements OnChanges, OnDestroy {
    @Input() public  jobId: string;
    @Input() public  taskId: string;

    public data: ListView<SubtaskInformation, SubtaskListParams>;

    public selectedTask: SubtaskInformation;
    public selectedTaskId: number;
    public subTasks: List<SubtaskInformation>;

    constructor(private taskService: TaskService, private changeDetector: ChangeDetectorRef) {

        this.data = this.taskService.listSubTasksView({});
        this.data.items.subscribe((subTasks) => {
            this.subTasks = subTasks;
            this._updateSelectedTask();
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.jobId || changes.taskId) {
            this.refresh();
        }
    }

    public ngOnDestroy() {
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { jobId: this.jobId, taskId: this.taskId };
        this.selectedTask = null;
        this.selectedTaskId = null;
        this.changeDetector.markForCheck();
        return this.data.fetchNext();
    }

    public selectedTaskChanged(id: number) {
        this.selectedTaskId = id;
        this._updateSelectedTask();
        this.changeDetector.markForCheck();
    }

    public onScrollToBottom() {
        this.data.fetchNext();
    }
    private _updateSelectedTask() {
        this.selectedTask = this.subTasks.find((subTask) => {
            return subTask.id === this.selectedTaskId;
        });
    }
}
