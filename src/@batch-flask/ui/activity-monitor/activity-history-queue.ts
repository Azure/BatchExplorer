import { Activity } from "@batch-flask/ui/activity-monitor";

export class ActivityHistoryQueue {
    private queue: Activity[];

    constructor() {
        this.queue = [];
    }

    /**
     * Enqueues a new activity onto the history queue
     * Note: For now, queue extends indefinitely. In the future, limit to a threshold value.
     * @param activity the activity to push onto the queue
     */
    public enqueue(activity) {
        this.queue.push(activity);
    }
}
