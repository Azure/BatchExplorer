import * as inflection from "inflection";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { BackgroundTask } from "@batch-flask/ui/background-task/background-task.model";
import { BackgroundTaskService } from "@batch-flask/ui/background-task/background-task.service";

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

        this.startAndWaitAsync();
    }

    /**
     * Will run the waiting action as a background task
     */
    public startAndWaitAsync(taskManager?: BackgroundTaskService) {
        this.action().subscribe({
            next: () => {
                this._actionDone.complete();
                this.wait();
            },
            error: (e) => {
                this._actionDone.error(e);
            },
        });
    }

    protected abstract action(): Observable<any>;
    protected abstract wait(taskManager?: BackgroundTaskService);

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
        current().subscribe({
            next: () => {
                this.progress.next(startingProgress + (progressIncrease * (index + 1) / funcs.length));
                this._performMultiple(funcs, index + 1, startingProgress, progressIncrease).subscribe({
                    next: () => {
                        obs.next(true);
                        obs.complete();
                    },
                    error: (x) => {
                        obs.error(x);
                    },
                });
            },
            error: (x) => {
                obs.error(x);
            },
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
    protected abstract waitForDelete(id: string, taskManager?: BackgroundTaskService);

    protected action() {
        this.progress.next(0);
        this.name.next(`Deleting ${this.itemIds.length} ${inflection.pluralize(this.entityName)}`);
        return this.performMultiple(this.itemIds.map((id) => {
            return () => this.deleteAction(id);
        }), 20);
    }

    protected wait(taskManager?: BackgroundTaskService) {
        this._updateWaitingMessage();
        for (const id of this.itemIds) {
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

// NOTE: pretty much copied and pasted the above and changed the names\
// will no doubt change somewhat ....
export abstract class LongRunningUploadAction extends LongRunningAction {
    protected uploadCount = 0;

    constructor(protected fileType: string, protected fileStreams: any[]) {
        super();
    }

    protected abstract uploadAction(id: string): Observable<any>;
    protected abstract waitForUpload(filename: string, taskManager?: BackgroundTaskService);

    protected action() {
        this.progress.next(0);
        this.name.next(`Uploading ${this.fileStreams.length} ${inflection.pluralize(this.fileType)}`);
        return this.performMultiple(this.fileStreams.map((stream) => {
            return () => this.uploadAction(stream);
        }), 20);
    }

    protected wait(taskManager?: BackgroundTaskService) {
        this._updateWaitingMessage();
        for (const stream of this.fileStreams) {
            this.waitForUpload(stream, taskManager);
        }
    }

    protected markItemAsUploaded() {
        this.uploadCount++;
        this._updateWaitingMessage();
        this.progress.next(20 + (this.uploadCount) * 80 / this.fileStreams.length);
        if (this.uploadCount === this.fileStreams.length) {
            this.waitingCompleted();
        }
    }

    private _updateWaitingMessage() {
        if (this.fileStreams.length === 1) {
            this.name.next(`Uploading ${this.fileType} ${this.fileStreams[0]}`);
        } else {
            this.name.next(`Waiting for ${this.fileType} upload ${this.uploadCount}/${this.fileStreams.length}`);
        }
    }
}
