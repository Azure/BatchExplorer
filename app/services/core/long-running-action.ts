import * as inflection from "inflection";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { BackgroundTask, BackgroundTaskManager } from "app/components/base/background-task";
/**
 * Base class for a long running action
 * e.g. Delete a pool takes a long time and need polling to check the status
 */
export abstract class LongRunningAction {
    public actionDone: Observable<any>;
    public waitingDone: Observable<any>;
    public progress: BehaviorSubject<number>;
    public name: BehaviorSubject<string>;

    private _actionDone = new AsyncSubject<any>();
    private _waitingDone = new AsyncSubject<any>();

    constructor() {
        this.progress = new BehaviorSubject(-1);
        this.name = new BehaviorSubject("");
        this.actionDone = this._actionDone.asObservable();
        this.waitingDone = this._waitingDone.asObservable();
    }

    public start(task: BackgroundTask) {
        this.progress = task.progress;
        this.name = task.name;

        this.action().subscribe(() => {
            this._actionDone.complete();
            this.wait();
        });
    }

    /**
     * Will run the waiting action as a background task
     */
    public startAndWaitAsync(taskManager?: BackgroundTaskManager) {
        this.action().subscribe(() => {
            this._actionDone.complete();
            this.wait(taskManager);
        });
    }

    protected abstract action(): Observable<any>;
    protected abstract wait(taskManager?: BackgroundTaskManager);

    protected waitingCompleted() {
        this._waitingDone.complete();
    }

    /**
     * This will perform multiple action sequentialy
     * @param progressIncrease If specified this will increase the progress by n points.
     *          After each action is done it will increase it slightly
     */
    protected performMultiple(funcs: Array<(() => Observable<any>)>, progressIncrease = 0): Observable<any> {
        const startingProgress = this.progress.getValue();
        return this._performMultiple(funcs, 0, startingProgress, progressIncrease);
    }

    private _performMultiple(
        funcs: Array<(() => Observable<any>)>,
        index: number,
        startingProgress: number,
        progressIncrease: number) {

        if (index === funcs.length) {
            return Observable.of({});
        }
        const current = funcs[index];
        const obs = new AsyncSubject();
        current().subscribe(() => {
            this.progress.next(startingProgress + (progressIncrease * (index + 1) / funcs.length));
            this._performMultiple(funcs, index + 1, startingProgress, progressIncrease).subscribe(() => {
                obs.next(true);
                obs.complete();
            });
        });
        return obs;
    }
}

export abstract class LongRunningDeleteAction extends LongRunningAction {
    protected itemDeleted = 0;

    constructor(protected entityName: string, protected itemIds: string[]) {
        super();
    }

    protected abstract deleteAction(id: string): Observable<any>;
    protected abstract waitForDelete(id: string, taskManager?: BackgroundTaskManager);

    protected action() {
        this.progress.next(0);
        this.name.next(`Deleting ${this.itemIds.length} ${inflection.pluralize(this.entityName)}`);
        return this.performMultiple(this.itemIds.map((id) => {
            return () => this.deleteAction(id);
        }), 20);
    }

    protected wait(taskManager?: BackgroundTaskManager) {
        this._updateWaitingMessage();
        for (let id of this.itemIds) {
            this.waitForDelete(id, taskManager);
        }
    }

    protected markItemAsDeleted() {
        this.itemDeleted++;
        this._updateWaitingMessage();
        this.progress.next(20 + (this.itemDeleted) * 80 / this.itemIds.length);
        if (this.itemDeleted === this.itemIds.length) {
            this.waitingCompleted();
        }
    }

    private _updateWaitingMessage() {
        if (this.itemIds.length === 1) {
            this.name.next(`Deleting ${this.entityName} ${this.itemIds[0]}`);
        } else {
            this.name.next(`Waiting for ${this.entityName} delete ${this.itemDeleted}/${this.itemIds.length}`);
        }
    }
}
