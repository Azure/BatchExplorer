import { Component, Input } from "@angular/core";
import { List } from "immutable";

import { BackgroundTask } from "./background-task.model";
import { BackgroundTaskService } from "./background-task.service";

import "./background-task-tracker.scss";

@Component({
    selector: "bl-background-task-tracker",
    templateUrl: "background-task-tracker.html",
})
export class BackgroundTaskTrackerComponent {

    public currentTask: BackgroundTask;
    public otherTasks: List<BackgroundTask>;

    /**
     * When adding a new task we should flash to tell the user a new task is running
     */
    public showFlash = false;

    private _lastTaskCount = 0;

    constructor(public taskManager: BackgroundTaskService) {
        taskManager.runningTasks.subscribe((tasks) => {
            this.currentTask = tasks.first();
            this.otherTasks = tasks.shift();
            if (this._lastTaskCount < tasks.size) {
                this.flash();
            }
            this._lastTaskCount = tasks.size;
        });
    }

    public flash() {
        this.showFlash = true;
        setTimeout(() => {
            this.showFlash = false;
        }, 1000);
    }
}

@Component({
    selector: "bl-background-task-tracker-item",
    templateUrl: "background-task-tracker-item.html",
})
export class BackgroundTaskTrackerItemComponent {
    @Input()
    public task: BackgroundTask;
}
