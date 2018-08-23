import { Injectable } from "@angular/core";
import { Activity, ActivityProcessor } from "@batch-flask/ui/activity-monitor/activity";
import { ActivityHistoryQueue } from "@batch-flask/ui/activity-monitor/activity-history-queue";
import { NotificationService } from "@batch-flask/ui/notifications";

@Injectable()
export class ActivityService {
    private masterProcessor: ActivityProcessor;
    private historyQueue: ActivityHistoryQueue;

    constructor(notificationService: NotificationService) {
        this.masterProcessor = new ActivityProcessor();
        this.historyQueue = new ActivityHistoryQueue();
    }

    public get activities() {
        return this.masterProcessor.activities;
    }

    public get incompleteActivities() {
        return this.masterProcessor.subActivitiesSubject.asObservable();
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
        this.masterProcessor.exec([activity]);

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

    public cancelMultiple(activities: Activity[]) {
        for (const activity of activities) {
            this.cancel(activity);
        }
    }

    private moveToHistory(activity) {
        this.masterProcessor.remove(activity);
        this.historyQueue.enqueue(activity);
    }
}
