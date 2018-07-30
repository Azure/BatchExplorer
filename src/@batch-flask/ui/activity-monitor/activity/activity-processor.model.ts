import { BehaviorSubject, Observable, combineLatest, merge } from "rxjs";

import { Activity, ActivityStatus } from "@batch-flask/ui/activity-monitor/activity";

export class ActivityProcessor {
    public activities: Activity[];
    public singleStatusSubject: BehaviorSubject<ActivityStatus>;
    public statusListSubject: BehaviorSubject<ActivityStatus[]>;

    constructor() {
        this.activities = [];
        this.singleStatusSubject = new BehaviorSubject(null);
        this.statusListSubject = new BehaviorSubject([]);
    }

    /**
     * Load the processor with activities and run the processor
     * @param activities A list of Activity objects
     */
    public loadAndRun(activities: Activity[]): void {
        this._load(activities);
        return this._startProcessor();
    }

    /**
     * Starts the processor by running every activity
     * Will combine all activity status observables into one observable, and emit it on change
     */
    private _startProcessor(): void {
        // compile and run all activities
        const statuses: Array<Observable<ActivityStatus>> = [];
        for (const activity of this.activities) {
            statuses.push(activity.statusSubject);
            activity.run();
        }

        // On each status change, emit the status to the parent activity
        merge(...statuses).subscribe(status => {
            this.singleStatusSubject.next(status);
        });

        // on any status change, emit the entire status list to the parent activity
        combineLatest(...statuses).subscribe(statusList => {
            this.statusListSubject.next(statusList);
        });
    }

    /**
     * Pushes the given activities onto the processor's activity list
     * @param activities An array of activities
     */
    private _load(activities: Activity[]): void {
        this.activities = activities;
    }
}
