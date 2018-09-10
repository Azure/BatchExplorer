import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Activity } from "@batch-flask/ui/activity/activity-types";
import { ActivityService } from "@batch-flask/ui/activity/activity.service";
import { Subscription } from "rxjs";

import "./activity-monitor-footer.scss";

@Component({
    selector: "bl-activity-monitor-footer",
    templateUrl: "activity-monitor-footer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorFooterComponent implements OnInit, OnDestroy {

    public currentActivity: Activity;
    public otherActivities: Activity[];

    /**
     * When adding a new task we should flash to tell the user a new task is running
     */
    public showFlash = false;

    private _lastTaskCount = 0;
    private _sub: Subscription;

    constructor(
        private activityService: ActivityService,
        private changeDetector: ChangeDetectorRef,
        private router: Router,
    ) {}

    public ngOnInit() {
        this._sub = this.activityService.incompleteActivities.subscribe(activities => {
            this.currentActivity = activities.first() ? activities.first() : null;
            this.otherActivities = activities.slice(1).reverse();
            if (this._lastTaskCount < activities.length) {
                this.flash();
            }
            this._lastTaskCount = activities.length;
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

    public openMonitor(id?: number): void {
        if (id !== null && id !== undefined) {
            this.router.navigate(["/activitymonitor", id]);
        } else {
            this.router.navigate(["/activitymonitor"]);
        }
    }
}
