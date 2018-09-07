import { Injectable } from "@angular/core";
import { ActivityFifoQueue } from "@batch-flask/ui/activity/activity-fifo-queue";
import { ActivityHistoryQueue } from "@batch-flask/ui/activity/activity-history-queue";
import { Activity, ActivityProcessor } from "@batch-flask/ui/activity/activity-types";

@Injectable()
export class ActivityService {
    private processor: ActivityProcessor;
    private historyQueue: ActivityHistoryQueue;
    private pendingQueue: ActivityFifoQueue;

    constructor() {
        this.processor = new ActivityProcessor();
        this.historyQueue = new ActivityHistoryQueue();
        this.pendingQueue = new ActivityFifoQueue();
    }

    public get activities() {
        return this.processor.activities;
    }

    public get incompleteActivities() {
        return this.processor.subActivitiesSubject.asObservable();
    }

    public get history() {
        return this.historyQueue.queueSubject.asObservable();
    }

    /**
     * Loads a single activity into the master processor, and runs the processor
     * N.B. this method is cascadable, in case it needs to be chained with done()
     * @param activity the activity to load into the master processor
     */
    public exec(activity: Activity): ActivityService {
        this.processor.exec([activity]);

        // when an activity completes, we should remove it from the masterprocessor
        activity.done.subscribe({
            next: () => {
                this.moveToHistory(activity);
            },
        });

        return this;
    }

    /**
     * Reruns the given activity by creating a clone of it and reexecuting it on the master processor
     * @param activity the activity to rerun
     */
    public rerun(activity: Activity): void {
        const copy = new Activity(activity.name, activity.initializer);
        this.exec(copy);
    }

    public cancel(activity: Activity): void {
        activity.cancel();
    }

    public cancelSelection(activities: Activity[]) {
        for (const activity of activities) {
            activity.cancelled = true;
            this.pendingQueue.remove(activity);
        }
        for (const activity of activities) {
            activity.cancel();
        }
    }

    public clearHistory() {
        this.historyQueue.clear();
    }

    private moveToHistory(activity) {
        this.processor.remove(activity);
        this.historyQueue.enqueue(activity);
    }
}
