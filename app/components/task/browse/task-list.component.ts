import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { TaskListDisplayComponent } from "./display";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { LoadingStatus } from "app/components/base/loading";
import { SelectableList } from "app/components/base/selectable-list";
import { Task } from "app/models";
import { TaskListParams, TaskParams, TaskService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";
import { DeleteTaskAction } from "../action";

@Component({
    selector: "bl-task-list",
    templateUrl: "task-list.html",
})
export class TaskListComponent extends SelectableList implements OnInit {
    public LoadingStatus = LoadingStatus;

    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public manualLoading: boolean;

    @Input()
    public set jobId(value: string) {
        this._jobId = (value && value.trim());
        this.refresh();
    }
    public get jobId() { return this._jobId; }

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;

        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter.toOData() });
        }

        this.data.fetchNext();
    }
    public get filter(): Filter { return this._filter; };

    @ViewChild(TaskListDisplayComponent)
    public list: TaskListDisplayComponent;

    public data: RxListProxy<TaskListParams, Task>;
    public status: Observable<LoadingStatus>;

    private _filter: Filter;
    private _jobId: string;
    private _baseOptions = { maxResults: 25 };
    private _onTaskAddedSub: Subscription;

    constructor(
        private taskService: TaskService,
        private changeDetectorRef: ChangeDetectorRef,
        private taskManager: BackgroundTaskManager) {
        super();

        this._onTaskAddedSub = taskService.onTaskAdded.subscribe((item: TaskParams) => {
            this.data.loadNewItem(taskService.get(item.jobId, item.id));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data = this.taskService.list(this._jobId, this._baseOptions);
        this.data.setOptions(Object.assign({}, this._baseOptions));
        this.status = this.data.status;
        this.changeDetectorRef.detectChanges();

        return this.data.fetchNext(true);
    }

    @autobind()
    public loadMore(): Observable<any> {
        return this.data.fetchNext();
    }

    public deleteSelected() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteTaskAction(this.taskService, this.jobId, this.selectedItems);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }
}
