import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { BackgroundTask } from "./background-task.model";
import { BackgroundTaskService } from "./background-task.service";

import "./background-task-tracker.scss";

@Component({
    selector: "bl-background-task-tracker",
    templateUrl: "background-task-tracker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundTaskTrackerComponent implements OnDestroy {

    public currentTask: BackgroundTask;
    public otherTasks: List<BackgroundTask>;

    /**
     * When adding a new task we should flash to tell the user a new task is running
     */
    public showFlash = false;

    private _lastTaskCount = 0;
    private _sub: Subscription;

    constructor(public taskManager: BackgroundTaskService, private changeDetector: ChangeDetectorRef) {
        this._sub = taskManager.runningTasks.subscribe((tasks) => {
            this.currentTask = tasks.first();
            this.otherTasks = tasks.shift();
            if (this._lastTaskCount < tasks.size) {
                this.flash();
            }
            this._lastTaskCount = tasks.size;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public flash() {
        this.showFlash = true;
        this.changeDetector.markForCheck();
        setTimeout(() => {
            this.showFlash = false;
            this.changeDetector.markForCheck();
        }, 1000);
    }

    public trackByFn(index, task: BackgroundTask) {
        return task.id;
    }
}
