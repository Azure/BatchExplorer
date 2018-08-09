import { Injectable } from "@angular/core";
import { Activity, ActivityProcessor, ActivityStatus } from "@batch-flask/ui/activity-monitor/activity";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Observable, forkJoin, of } from "rxjs";
import { flatMap, map } from "rxjs/operators";

@Injectable()
export class ActivityService {
    private masterProcessor: ActivityProcessor;

    constructor(notificationService: NotificationService) {
        this.masterProcessor = new ActivityProcessor();
    }

    public get activities() {
        return this.masterProcessor.activities;
    }

    public get incompleteSnapshots() {
        return this.masterProcessor.snapshotsSubject.pipe(
            map(snapshots => {
                return snapshots.filter(snapshot => !this._isCompleted(snapshot.status));
            }),
        );
    }

    /**
     * Loads a single activity into the master processor, and runs the processor
     * N.B. this method is cascadable, in case it needs to be chained with done()
     * @param activity the activity to load into the master processor
     */
    public loadAndRun(activity: Activity): ActivityService {
        this.masterProcessor.loadAndRun([activity]);
        return this;
    }

    public done(): Observable<ActivityStatus> {
        const doneObservables = this.masterProcessor.activities.map(activity => activity.done.asObservable());
        return forkJoin(...doneObservables).pipe(
            flatMap(() => {
                return of(ActivityStatus.Completed);
            }),
        );
    }

    private _isCompleted(status): boolean {
        return status === ActivityStatus.Completed
            || status === ActivityStatus.Canceled
            || status === ActivityStatus.Failed;
    }
}
