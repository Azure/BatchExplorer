import { Component, Input, OnDestroy } from "@angular/core";

import { Task, TaskDependency } from "app/models";
import { TaskService } from "app/services";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "bex-task-dependencies",
    templateUrl: "task-dependencies.html",
})
export class TaskDependenciesComponent implements OnDestroy {
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
            this.taskService.getMultiple(this.jobId, taskIdSet).subscribe({
                next: (response: any) => {
                    if (response.data) {
                        this._processGetMultipleResponse(response, currentPage);
                    }
                },
            });

            this._skip += this._take;
            this.hasMore = this._skip < this.dependentIds.length;
        } else {
            this.hasMore = false;
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }

    private _refresh(task: Task) {
        this._skip = 0;
        this._take = 15;

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
    private _processGetMultipleResponse(response: any, pageData: TaskDependency[]): void {
        if (response.data) {
            pageData.forEach(td => {
                const found = response.data.filter(item => item.id === td.id);
                if (found && found.length > 0) {
                    td.state = found[0].state;
                    const dependencies = found[0].dependsOn;
                    if (dependencies) {
                        const count = this._taskDependenciesCount(dependencies);

                        /* tslint:disable:no-empty */
                        if (count === 0) {
                        } else if (count <= 2) {
                            const ids = this._getTaskDependencyIds(dependencies);
                            td.dependsOn = ids.join(",");
                        } else {
                            td.dependsOn = `${count} tasks`;
                        }
                    } else {
                        td.dependsOn = "no tasks";
                    }
                }
            });
        }
    }

    /**
     * Get the list of task id's to display on the current page.
     * @param dependencies: list of dependencies from the selected task
     */
    private _getTaskDependencyIds(dependencies: any): string[] {
        const ids = dependencies.taskIds || [];
        const ranges = dependencies.taskIdRanges;
        let out = ids;

        if (!ranges) {
            return out;
        }

        for (let range of ranges) {
            for (let id = range.start; id <= range.end; id++) {
                out.push(id.toString());
            }
        }

        return out;
    }

    /**
     * Get the task.dependsOn count for displaying in the table.
     */
    private _taskDependenciesCount(dependencies: any): number {
        const ids = dependencies.taskIds;
        const ranges = dependencies.taskIdRanges;
        const count = ids ? ids.length : 0;
        const rangeCount = ranges
            ? ranges.map((x) => (x.end - x.start + 1)).reduce((range, out) => out + range, 0)
            : 0;

        return count + rangeCount;
    }
}
