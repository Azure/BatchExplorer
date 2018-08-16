import { BehaviorSubject, Observable, Subscription, combineLatest, merge } from "rxjs";

import { ActivityStatus } from "./activity-datatypes";
import { Activity } from "./activity.model";

export class ActivityProcessor {
    public activities: Activity[];
    public completionSubject: BehaviorSubject<ActivityStatus>;
    public subActivitiesSubject: BehaviorSubject<Activity[]>;

    private completionSubscription: Subscription;
    private subActivitiesSubscription: Subscription;

    constructor() {
        this.activities = [];
        this.completionSubject = new BehaviorSubject(null);
        this.subActivitiesSubject = new BehaviorSubject([]);

        this.subActivitiesSubject.subscribe(subactivities => {
            this.activities = subactivities;
        });

        this.completionSubscription = null;
        this.subActivitiesSubscription = null;
    }

    /**
     * Load the processor with activities and run the processor
     * @param activities A list of Activity objects
     */
    public exec(activities: Activity[]): void {
        const actList = this.activities.concat(activities);
        this.subActivitiesSubject.next(actList);
        return this._startProcessor();
    }

    /**
     * Removes an activity from the processor
     * @param activity the activity to be removed
     */
    public remove(activity: Activity): void {
        const activities = this.activities.filter(a => a.id !== activity.id);
        this.subActivitiesSubject.next(activities);

        this._startProcessor();
    }

    /**
     * Starts the processor by running every activity
     * Will combine all activity status observables into one observable, and emit it on change
     */
    private _startProcessor(): void {
        // compile and run all activities
        const statuses: Array<Observable<ActivityStatus>> = [];
        const completions: Array<Observable<ActivityStatus>> = [];

        const pendingActivities = this.activities.filter(activity => !activity.isComplete);
        for (const activity of pendingActivities) {
            statuses.push(activity.statusSubject);

            if (activity.pending) {
                activity.run();
            }
            completions.push(activity.done.asObservable());
        }

        // On each activity completion, emit the status to the parent activity
        if (this.completionSubscription && !this.completionSubscription.closed) {
            this.completionSubscription.unsubscribe();
        }
        this.completionSubscription = merge(...completions).subscribe(status => {
            this.completionSubject.next(status);
        });

        // on any status change, re-emit the entire activity list to the parent activity
        if (this.subActivitiesSubscription && !this.subActivitiesSubscription.closed) {
            this.subActivitiesSubscription.unsubscribe();
        }
        this.subActivitiesSubscription = combineLatest(...statuses).subscribe(() => {
            this.subActivitiesSubject.next(pendingActivities);
        });
    }
}
