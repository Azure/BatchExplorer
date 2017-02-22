import { Component, Input } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";

import { Task, TaskDependencies, TaskDependency } from "app/models";
import { TaskService } from "app/services";

@Component({
    selector: "bl-task-dependencies",
    templateUrl: "task-dependencies.html",
})
export class TaskDependenciesComponent {
    @Input()
    public set jobId(value: string) {
        this._jobId = (value && value.trim());
    }
    public get jobId() { return this._jobId; }

    @Input()
    public set task(task: Task) {
        this._task = task;
        this._refresh(task);
    }
    public get task() { return this._task; }

    public dependentIds: string[] = [];
    public dependencies: BehaviorSubject<TaskDependency[]>;
    public loadingMore: boolean = false;
    public hasMore: boolean = false;

    private _jobId: string;
    private _task: Task;
    private _skip: number;
    private _take: number;

    constructor(
        private taskService: TaskService) {
    }

    public loadMore() {
        if (this.dependentIds.length > 0) {
            const endIndex = this._skip + Math.min(this._take, this.dependentIds.length - this._skip);
            const taskIdSet = this.dependentIds.slice(this._skip, endIndex);
            const currentPage = taskIdSet.map(id => {
                return new TaskDependency(id);
            });

            this.dependencies.next(this.dependencies.value.concat(currentPage));
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
    }

    private _refresh(task: Task) {
        this._skip = 0;
        this._take = 20;

        this.dependencies = new BehaviorSubject<TaskDependency[]>([]);
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
        for (let td of pageData) {
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
    };

    /**
     * Get the list of task id's to display on the current page.
     * @param dependencies: list of dependencies from the selected task
     */
    private _getTaskDependencyIds(dependencies: TaskDependencies): string[] {
        const ids = dependencies.taskIds;
        const ranges = dependencies.taskIdRanges;
        let out = ids.toJS();

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
