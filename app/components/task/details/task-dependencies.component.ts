import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";

import { Task, TaskDependency } from "app/models";

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
        this.refresh(task);
    }
    public get task() { return this._task; }

    public dependentIds: string[] = [];
    public dependencies: TaskDependency[] = [];
    public loadingMore: boolean = false;
    public hasMore: boolean = false;

    private _jobId: string;
    private _task: Task;
    private _skip: number;
    private _take: number;

    constructor(private viewContainerRef: ViewContainerRef) {
        this._skip = 0;
        this._take = 15;
    }

    public refresh(task: Task) {
        this.dependentIds = (task && task.dependsOn)
            ? this._getTaskDependencyIds(task.dependsOn)
            : [];

        this.loadMore();
    }

    public loadMore() {
        console.log(`loadMore ... skip: ${this._skip}, take: ${this._take}, length: ${this.dependentIds.length}`);
        if (this.dependentIds.length > 0) {
            this.dependencies.push(... this.dependentIds.slice(this._skip, this._skip + this._take).map(id => {
                return new TaskDependency(id);
            }));

            // todo: more work on this to make sure its correct.
            // BELOW CODE SNIPPET
            this._skip += this._take;
            this.hasMore = this._skip < this.dependentIds.length;
        }
    }

    public ngOnDestroy() {
        /* tab hide */
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
}

// function getTaskDependenciesIds(dependencies: TaskDependencies, skip: number, take: number): string[] {
//     "use strict";

//     const ids = dependencies.taskIds() || [];
//     const ranges = dependencies.taskIdRanges();
//     let out = ids.slice(skip, take);
//     let leftToSkip = skip - ids.length;
//     let leftToTake = take - out.length;

//     if (leftToSkip < 0) {
//         leftToSkip = 0;
//     }

//     if (!ranges) {
//         return out;
//     }

//     for (let range of ranges) {
//         if (leftToTake <= 0) {
//             break;
//         }
//         const rangeLength = range.end() - range.start() + 1;
//         if (leftToSkip < rangeLength) {
//             const start = range.start() + leftToSkip;
//             const end = start + Math.min(leftToTake, rangeLength - leftToSkip);
//             leftToSkip = 0;
//             for (let i = start; i < end; i++) {
//                 out.push(i.toString());
//             }
//             leftToTake = take - out.length;
//         } else {
//             leftToSkip -= rangeLength;
//         }
//     }
//     return out;
// }
