import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, OnInit, ViewChild, forwardRef,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { QuickListItemStatus } from "@batch-flask/ui";
import { AbstractListBaseConfig } from "@batch-flask/ui/abstract-list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Task, TaskState } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";
import { TaskListParams, TaskParams, TaskService } from "app/services";
import { ComponentUtils, DateUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";
import { TaskCommands } from "../action";
import { TaskListDisplayComponent } from "./display";

import "./task-list.scss";

@Component({
    selector: "bl-task-list",
    templateUrl: "task-list.html",
    providers: [TaskCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => TaskListComponent),
    }],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent extends ListBaseComponent implements OnInit, OnChanges, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public jobId: string;

    @ViewChild(TaskListDisplayComponent)
    public list: TaskListDisplayComponent;

    public data: ListView<Task, TaskListParams>;

    public listConfig: AbstractListBaseConfig = {
        sorting: {
            state: true,
        },
    };

    public tasks: List<Task> = List([]);

    private _baseOptions = {
        select: "id,state,creationTime,lastModified,executionInfo",
    };
    private _onTaskAddedSub: Subscription;

    constructor(
        public commands: TaskCommands,
        private taskService: TaskService,
        activatedRoute: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.data = this.taskService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.data.status.subscribe((status) => {
            this.status = status;
            this.changeDetector.markForCheck();
        });

        this.data.items.subscribe((items) => {
            this.tasks = items;
            this.changeDetector.markForCheck();
        });

        this._onTaskAddedSub = taskService.onTaskAdded.subscribe((item: TaskParams) => {
            this.data.loadNewItem(taskService.get(item.jobId, item.id));
        });
    }

    public ngOnChanges(changes) {
        if (changes.jobId) {
            this.commands.params = { jobId: this.jobId };
            this.data.params = { jobId: this.jobId };
            this.data.refresh();
        }
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._onTaskAddedSub.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { jobId: this.jobId };
        this.data.setOptions(Object.assign({}, this._baseOptions));
        this.changeDetectorRef.detectChanges();

        return this.data.fetchNext(true);
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter: filter });
        }

        this.data.fetchNext();
    }

    public onScrollToBottom(): Observable<any> {
        return this.data.fetchNext();
    }

    public deleteSelection(selection: ListSelection) {
        this.commands.delete.executeFromSelection(selection).subscribe();
    }

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
        console.log("Formatdate");
        return DateUtils.prettyDate(date, 7);
    }
}
