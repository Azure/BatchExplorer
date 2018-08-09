import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { Subscription } from "rxjs";

import "./activity-monitor-footer.scss";

@Component({
    selector: "bl-activity-monitor-footer",
    templateUrl: "activity-monitor-footer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorFooterComponent implements OnDestroy {

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
