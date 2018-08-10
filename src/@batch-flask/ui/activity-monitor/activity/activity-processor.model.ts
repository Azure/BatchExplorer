import { BehaviorSubject, Observable, combineLatest, merge } from "rxjs";

import { ActivitySnapshot, ActivityStatus } from "./activity-datatypes";
import { Activity } from "./activity.model";

export class ActivityProcessor {
    public activities: Activity[];
    public completionSubject: BehaviorSubject<ActivityStatus>;
    public snapshotsSubject: BehaviorSubject<ActivitySnapshot[]>;

    constructor() {
        this.activities = [];
        this.completionSubject = new BehaviorSubject(null);
        this.snapshotsSubject = new BehaviorSubject([]);
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
        const completions: Array<Observable<ActivityStatus>> = [];
        const pendingActivities = this.activities.filter(activity => activity.pending);
        for (const activity of pendingActivities) {
            statuses.push(activity.statusSubject);
            activity.run();

            completions.push(activity.done.asObservable());
        }

        // On each activity completion, emit the status to the parent activity
        merge(...completions).subscribe(status => {
            this.completionSubject.next(status);
        });

        // on any status change, emit the entire status list to the parent activity
        combineLatest(...statuses).subscribe(statusList => {
            const snapshots = statusList.map((status, index) => ({
                activity: pendingActivities[index],
                status,
            } as ActivitySnapshot));

            this.snapshotsSubject.next(snapshots);
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
