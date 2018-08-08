import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { Subscription } from "rxjs";

import "./background-task-tracker.scss";

@Component({
    selector: "bl-background-task-tracker",
    templateUrl: "background-task-tracker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundTaskTrackerComponent implements OnDestroy {

    public currentActivity: Activity;
    public otherActivities: Activity[];

    /**
     * When adding a new task we should flash to tell the user a new task is running
     */
    public showFlash = false;

    private _lastTaskCount = 0;
    private _sub: Subscription;

    constructor(public activityService: ActivityService, private changeDetector: ChangeDetectorRef) {

        this._sub = activityService.incompleteSnapshots.subscribe((snapshots) => {
            this.currentActivity = snapshots.first() ? snapshots.first().activity : null;
            this.otherActivities = snapshots.slice(1).map(snapshot => snapshot.activity);
            if (this._lastTaskCount < snapshots.length) {
                this.flash();
            }
            this._lastTaskCount = snapshots.length;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public flash() {
        this.showFlash = true;
        this.changeDetector.markForCheck();
        setTimeout(() => {
            this.showFlash = false;
            this.changeDetector.markForCheck();
        }, 1000);
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }
}
