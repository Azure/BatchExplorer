import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { Task, TaskDependencies, TaskDependency } from "app/models";
import { TaskService } from "app/services";

@Component({
    selector: "bl-task-dependencies",
    templateUrl: "task-dependencies.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDependenciesComponent implements OnChanges {
    @Input() public jobId: string;
    @Input() public task: Task;

    public dependentIds: string[] = [];
    public dependencies: List<TaskDependency> = List([]);
    public status = LoadingStatus.Loading;
    public hasMore: boolean = false;

    private _skip: number;
    private _take: number;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private taskService: TaskService) {
    }

    public ngOnChanges(changes) {
        if (changes.jobId || changes.task) {
            this._refresh(this.task);
        }
    }
    public loadMore() {
        this.status = LoadingStatus.Loading;
        if (this.dependentIds.length > 0) {
            const endIndex = this._skip + Math.min(this._take, this.dependentIds.length - this._skip);
            const taskIdSet = this.dependentIds.slice(this._skip, endIndex);
            const currentPage = taskIdSet.map(id => {
                return new TaskDependency(id);
            });
            this.dependencies = List(this.dependencies.concat(currentPage));
            this.taskService.getMultiple(this.jobId, taskIdSet, this.taskService.basicProperties).subscribe({
                next: (tasks: List<Task>) => {
                    if (tasks) {
                        this._processMultipleTaskResponse(tasks, currentPage);
                    }
                },
            });

            this._skip += this._take;
            this.hasMore = this._skip < this.dependentIds.length;
        } else {
            this.hasMore = false;
        }
        this.changeDetector.markForCheck();
    }

    public trackByFn(index, dependency: TaskDependency) {
        return dependency.id;
    }

    private _refresh(task: Task) {
        this._skip = 0;
        this._take = 20;

        this.dependencies = List([]);
        this.dependentIds = (task && task.dependsOn)
            ? this._getTaskDependencyIds(task.dependsOn)
            : [];

        this.loadMore();
    }

    /**
     * Process the data returned from the API for the current page of taskId's we are showing
     * @param response: api reponse
     * @param pageData: data for the current page
     */
    private _processMultipleTaskResponse(tasks: List<Task>, pageData: TaskDependency[]): void {
        this.status = LoadingStatus.Ready;

        for (const td of pageData) {
            td.loading = false;

            const found = tasks && tasks.size > 0
                ? tasks.filter(item => item.id === td.id).first()
                : null;

            if (!found) {
                continue;
            }

            td.state = found.state;
            const dependencies = found.dependsOn;
            if (dependencies) {
                const count = this._taskDependenciesCount(dependencies);
                if (count > 0 && count <= 2) {
                    const ids = this._getTaskDependencyIds(dependencies);
                    td.dependsOn = ids.join(",");
                } else {
                    td.dependsOn = `${count} tasks`;
                }
            } else {
                td.dependsOn = "no tasks";
            }
        }
        this.changeDetector.markForCheck();
    }

    /**
     * Get the list of task id's to display on the current page.
     * @param dependencies: list of dependencies from the selected task
     */
    private _getTaskDependencyIds(dependencies: TaskDependencies): string[] {
        const ids = dependencies.taskIds;
        const ranges = dependencies.taskIdRanges;
        const out = ids.toJS();

        if (!ranges) {
            return out;
        }

        ranges.forEach((range) => {
            for (let id = range.start; id <= range.end; id++) {
                out.push(id.toString());
            }
        });

        return out;
    }

    /**
     * Get the task.dependsOn count for displaying in the table.
     */
    private _taskDependenciesCount(dependencies: TaskDependencies): number {
        const ids = dependencies.taskIds;
        const ranges = dependencies.taskIdRanges;
        const count = ids ? ids.size : 0;
        const rangeCount = ranges.map((x) => (x.end - x.start + 1)).reduce((range, out) => out + range, 0);

        return count + rangeCount;
    }
}
