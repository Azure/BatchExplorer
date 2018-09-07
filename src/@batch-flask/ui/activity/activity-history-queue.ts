import { Activity } from "@batch-flask/ui/activity/activity-types";
import { BehaviorSubject } from "rxjs";

export class ActivityHistoryQueue {
    public queueSubject: BehaviorSubject<Activity[]>;
    private _queue: Activity[];

    constructor() {
        this._queue = [];
        this.queueSubject = new BehaviorSubject(this._queue);
    }

    /**
     * Enqueues a new activity onto the history queue
     * Note: For now, queue extends indefinitely. In the future, limit to a threshold value.
     * @param activity the activity to push onto the queue
     */
    public enqueue(activity) {
        this._queue.push(activity);
        this.queueSubject.next(this._queue);
    }

    public clear() {
        this._queue = [];
        this.queueSubject.next(this._queue);
    }
}
