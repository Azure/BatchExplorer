import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { Task, TaskDependencies, TaskDependency } from "app/models";
import { TaskService } from "app/services";
import { ComponentUtils } from "app/utils";

@Component({
    selector: "bl-task-dependency-browser",
    templateUrl: "task-dependency-browser.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDependencyBrowserComponent implements OnChanges {
    @Input() public jobId: string;
    @Input() public task: Task;

    public dependentIds: string[] = [];
    public dependencies: List<TaskDependency> = List([]);

    private _loaded = 0;
    private _tasks = new Map<string, Task>();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private taskService: TaskService) {
    }

    public ngOnChanges(changes) {
        if (changes.jobId) {
            this._tasks.clear();
        }

        // Task initially loaded with no dedendsOn. Change to task properties was not handled here.
        if (changes.jobId || ComponentUtils.recordChangedId(changes.task) || changes.task) {
            this._loaded = 0;
            this._refresh(this.task);
        }
    }

    private _refresh(task: Task) {
        this.dependentIds = (task && task.dependsOn)
            ? this._getTaskDependencyIds(task.dependsOn)
            : [];
        this._updateDependencies();
        this._loadTasks();
    }

    private _loadTasks() {
        if (this._loaded >= this.dependentIds.length) { return; }
        this.taskService.getMultiple(this.jobId, this.dependentIds.slice(this._loaded, this._loaded + 20),
            this.taskService.basicProperties).subscribe({
                next: (tasks: List<Task>) => {
                    this._loaded = this._loaded + 20;
                    this._processMultipleTaskResponse(tasks);
                    this._loadTasks();
                },
            });
    }

    private _updateDependencies() {
        this.dependencies = List(this.dependentIds.map((id, index) => {
            const dep = new TaskDependency(id);
            dep.loading = this._loaded < index;
            if (this._tasks.has(id)) {
                const task = this._tasks.get(id);
                dep.task = task;
                dep.loading = false;

                const dependencies = task.dependsOn;
                if (dependencies) {
                    const count = this._taskDependenciesCount(dependencies);
                    if (count > 0 && count <= 2) {
                        const ids = this._getTaskDependencyIds(dependencies);
                        dep.dependsOn = ids.join(",");
                    } else {
                        dep.dependsOn = `${count} tasks`;
                    }
                } else {
                    dep.dependsOn = "No tasks";
                }
                dep.routerLink = ["/jobs", this.jobId, "tasks", id];
            }

            return dep;
        }));
        this.changeDetector.markForCheck();
    }

    /**
     * Process the data returned from the API for the current page of taskId's we are showing
     * @param response: api reponse
     * @param pageData: data for the current page
     */
    private _processMultipleTaskResponse(tasks: List<Task>): void {
        tasks.forEach((x) => {
            this._tasks.set(x.id, x);
        });
        this._updateDependencies();
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
