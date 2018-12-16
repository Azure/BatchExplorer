import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    forwardRef,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
import { QuickListItemStatus } from "@batch-flask/ui";
import { AbstractListBaseConfig, ListBaseComponent } from "@batch-flask/ui/abstract-list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { FailureInfoDecorator } from "app/decorators";
import { Task, TaskState } from "app/models";
import { TaskListParams, TaskParams, TaskService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription, of } from "rxjs";
import { TaskCommands } from "../action";

import { map } from "rxjs/operators";
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
export class TaskListComponent extends ListBaseComponent implements OnChanges, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public jobId: string;

    public data: ListView<Task, TaskListParams>;

    public listConfig: AbstractListBaseConfig<Task> = {
        sorting: {
            id: true,
            state: true,
            runtime: true,
            creationTime: true,
            startTime: (task) => task.executionInfo && task.executionInfo.startTime,
            endTime: (task) => task.executionInfo && task.executionInfo.endTime,
            exitCode: (task) => task.executionInfo && task.executionInfo.exitCode,
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
        injector: Injector,
        activatedRoute: ActivatedRoute) {
        super(injector);
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

    public ngOnDestroy() {
        this._onTaskAddedSub.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { jobId: this.jobId };
        this.data.setOptions(Object.assign({}, this._baseOptions));
        this.changeDetector.detectChanges();

        return this.data.fetchNext(true);
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter: filter });
        }
        if (this.jobId) {
            return this.data.fetchNext().pipe(map(x => x.items.size));
        } else {
            return of(null);
        }
    }

    public onScrollToBottom(): Observable<any> {
        if (this.jobId) {
            return this.data.fetchNext();
        } else {
            return of(null);
        }
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
}
