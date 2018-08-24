import { Activity } from "@batch-flask/ui/activity-monitor";

/**
 * Keeps track of a fifo queue of activities to process such that only a given number are executing at once
 * Singleton class - each call to new ActivityFifoQueue() will return the exact same instance
 */
export class ActivityFifoQueue {
    private static instance: ActivityFifoQueue;
    private fifoQueue: Activity[];
    private running: number[];

    private MAXIMUM_CONCURRENT_ACTIVITIES = 10;

    constructor() {
        if (ActivityFifoQueue.instance) {
            return ActivityFifoQueue.instance;
        }

        this.fifoQueue = [];
        this.running = [];

        ActivityFifoQueue.instance = this;
    }

    /**
     * Enqueue an activity in the fifo queue
     * Note that it may run immediately without being enqueued, if possible
     * @param activity The activity to be run or enqueued
     */
    public enqueue(activity: Activity) {
        // if we have few enough activities running, run this immediately
        if (this.running.length < this.MAXIMUM_CONCURRENT_ACTIVITIES) {
            this._run(activity);
        } else {
            this.fifoQueue.push(activity);
        }
    }

    private _dequeue() {
        if (this.fifoQueue.length === 0) { return; }
        this._run(this.fifoQueue.shift());
    }

    private _run(activity: Activity) {
        activity.run();
        this.running.push(activity.id);

        // when the activity is done, remove its id from the array of running activities
        activity.done.subscribe(() => {
            const index = this.running.indexOf(activity.id);
            this.running.splice(index, 1);

            // then, dequeue another activity
            this._dequeue();
        });
    }
}
