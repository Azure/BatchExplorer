import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { log } from "@batch-flask/utils";
import { NotificationService } from "../notifications";
import {
    BackgroundTask, GroupedBackgroundTask, GroupedBackgroundTaskResult,
    NamedTaskFunction, SingleBackgroundTask, TaskFunction,
} from "./background-task.model";

@Injectable()
export class BackgroundTaskService {
    public runningTasks: Observable<List<BackgroundTask>>;

    private _runningTasks = new BehaviorSubject<List<BackgroundTask>>(List([]));

    constructor(private notificationService: NotificationService) {
        this.runningTasks = this._runningTasks.asObservable();
    }

    public startTask(name, func: TaskFunction): Observable<boolean> {
        const task = new SingleBackgroundTask(this, name, func);
        this._queueTask(task);

        return task.done;
    }

    public startTasks(name, tasks: NamedTaskFunction[]): Observable<GroupedBackgroundTaskResult> {
        const task = new GroupedBackgroundTask(this, name, tasks);
        this._queueTask(task);

        return task.done;
    }

    public completeTask(id: string) {
        const newTasks = List<BackgroundTask>(this._runningTasks.value.filter(x => x.id !== id));
        this._runningTasks.next(newTasks);
    }

    public taskFailed(task: BackgroundTask, error) {
        this.completeTask(task.id);
        this.notificationService.error(`An error occured in "${task.name.value}"`, error.toString());
        log.error("Error in background task", error);
    }

    private _queueTask(task: BackgroundTask) {
        this._runningTasks.next(this._runningTasks.getValue().push(task));
        task.start();
    }
}
