import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, ViewChild,
} from "@angular/core";
import { ListView,  autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { SubtaskInformation } from "app/models";
import { SubtaskListParams, TaskService } from "app/services";
import { List } from "immutable";
import { Observable } from "rxjs";
import { SubTaskDisplayListComponent } from "./sub-tasks";

@Component({
    selector: "bl-task-sub-tasks-tab",
    templateUrl: "task-sub-tasks-tab.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskSubTasksTabComponent extends ListBaseComponent implements OnChanges, OnDestroy {
    @Input() public set jobId(value: string) {
        this._jobId = (value && value.trim());
    }
    public get jobId() { return this._jobId; }

    @Input() public set taskId(value: string) {
        this._taskId = (value && value.trim());
    }
    public get taskId() { return this._jobId; }

    @ViewChild(SubTaskDisplayListComponent)
    public list: any;

    public data: ListView<SubtaskInformation, SubtaskListParams>;

    public selectedTask: SubtaskInformation;
    public selectedTaskId: number;
    public subTasks: List<SubtaskInformation>;

    private _jobId: string;
    private _taskId: string;

    constructor(private taskService: TaskService, changeDetector: ChangeDetectorRef) {
        super(changeDetector);

        this.data = this.taskService.listSubTasksView({});
        this.data.items.subscribe((subTasks) => {
            this.subTasks = subTasks;
            this._updateSelectedTask();
            this.changeDetector.markForCheck();
        });

        this.data.status.subscribe((status) => {
            this.status = status;
        });
    }

    public ngOnChanges(changes) {
        if (changes.jobId || changes.taskId) {
            this.refresh();
        }
    }
    public ngOnDestroy() {
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { jobId: this._jobId, taskId: this._taskId };
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
