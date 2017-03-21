import { ChangeDetectorRef, Component, Input, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { SubTaskDisplayListComponent } from "./sub-tasks";

import { LoadingStatus } from "app/components/base/loading";
import { SelectableList } from "app/components/base/selectable-list";
import { SubtaskInformation } from "app/models";
import { SubtaskListParams, TaskService } from "app/services";
import { RxListProxy } from "app/services/core";

@Component({
    selector: "bl-task-sub-tasks-tab",
    templateUrl: "task-sub-tasks-tab.html",
})
export class TaskSubTasksTabComponent extends SelectableList {
    @Input()
    public quickList: boolean;

    @Input()
    public set jobId(value: string) {
        this._jobId = (value && value.trim());
    }
    public get jobId() { return this._jobId; }

    @Input()
    public set taskId(value: string) {
        this._taskId = (value && value.trim());
        this.refresh();
    }
    public get taskId() { return this._jobId; }

    public get selectedTask() { return this._selectedTask; }

    @ViewChild(SubTaskDisplayListComponent)
    public list: SubTaskDisplayListComponent;

    public data: RxListProxy<SubtaskListParams, SubtaskInformation>;
    public status: Observable<LoadingStatus>;

    private _jobId: string;
    private _taskId: string;
    private _selectedTask: SubtaskInformation;

    constructor(private taskService: TaskService, private changeDetectorRef: ChangeDetectorRef) {
        super();

        this.activatedItemChange.subscribe((item) => {
            this.data.items.subscribe((subTasks) => {
                this._selectedTask = subTasks.find((subTask) => {
                    return subTask.id === item.key;
                });
            });
        });
    }

    @autobind()
    public refresh(): Observable<any> {
        this._selectedTask = null;
        this.data = this.taskService.listSubTasks(this._jobId, this._taskId, {});
        this.status = this.data.status;
        this.changeDetectorRef.detectChanges();

        return this.data.fetchNext();
    }
}
