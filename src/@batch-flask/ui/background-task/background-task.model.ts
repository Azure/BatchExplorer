import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { log } from "@batch-flask/utils";
import { BackgroundTaskService } from "./background-task.service";

/**
 * Function that run the task.
 * @param progress Subject that should keep track of the progress(from 0 to 100);
 */
export type TaskFunction = (task: BackgroundTask) => Observable<any>;
export interface NamedTaskFunction {
    name: string;
    func: TaskFunction;
}

export abstract class BackgroundTask<T = any> {
    /**
     * Delay the task will wait before notifying the managaer it has completed
     */
    public static readonly completeDelay = 1000;
    public static idCounter = 0;

    public id: string;
    public progress = new BehaviorSubject<number>(-1);
    public name = new BehaviorSubject<string>("");
    public done: Observable<T>;

    protected _done = new AsyncSubject<T>();

    constructor(protected taskManager: BackgroundTaskService) {
        this.done = this._done.asObservable();
        this.id = (BackgroundTask.idCounter++).toString();
    }

    public abstract start(): void;

    protected errored(error) {
        this.taskManager.taskFailed(this, error);
        this._done.error(error);
        this._done.complete();
    }

    protected end(result?: T) {
        this._done.next(result);
        this._done.complete();
        setTimeout(() => {
            this.taskManager.completeTask(this.id);
        }, BackgroundTask.completeDelay);
    }
}

export class SingleBackgroundTask extends BackgroundTask {
    constructor(taskManager: BackgroundTaskService, name: string, public func: TaskFunction) {
        super(taskManager);
        this.name.next(name);
    }

    public start() {
        const obs = this.func(this);
        obs.subscribe({
            error: (error) => {
                this.errored(error);
            },
            complete: () => {
                this.end();
            },
        });
    }
}

export interface GroupedBackgroundTaskResult {
    succeeded: number;
    failed: number;
    total: number;
    errors: any[];
}

export class GroupedBackgroundTask extends BackgroundTask<GroupedBackgroundTaskResult> {
    public progress = new BehaviorSubject<number>(0);

    private _current: GroupedBackgroundTaskResult = {
        succeeded: 0,
        failed: 0,
        total: 0,
        errors: [],
    };

    constructor(
        taskManager: BackgroundTaskService,
        private _baseName: string,
        private _tasks: NamedTaskFunction[]) {

        super(taskManager);
    }

    public start() {
        const totalTask = this._tasks.length;

        const obs = Observable.from(this._tasks)
            .concatMap((task, index) => {
                this.progress.next((index + 1) / totalTask * 100);
                this.name.next(`${this._baseName} (${index + 1}/${totalTask})`);

                const taskObs = task.func(null);

                taskObs.subscribe({
                    complete: () => {
                        this._current.succeeded++;
                        this._current.total++;
                    },
                    error: (e) => {
                        this._current.failed++;
                        this._current.total++;
                        this._current.errors.push(e);
                        log.error("Error completing task", e);
                    },
                });
                return taskObs;
            }).shareReplay(1);

        obs.subscribe({
            complete: () => {
                if (this._current.failed === this._current.total) {
                    this.errored(this._current);
                } else {
                    this.end(this._current);
                }
            },
        });
    }

    private _runNextTask(index = 0) {
        const totalTask = this._tasks.length;

        if (index === totalTask) {
            this.end();
            return;
        }
        const task = this._tasks[index];
        const obs = task.func(null);
        this.name.next(`${this._baseName} (${index + 1}/${totalTask})`);
        obs.subscribe({
            error: (error) => {
                this.errored(error);
            },
            complete: () => {
                this.progress.next((index + 1) / totalTask * 100);
                this._runNextTask(index + 1);
            },
        });
    }
}
