import { Component, HostListener, OnInit } from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { BehaviorSubject } from "rxjs";

import "./activity-monitor.scss";

@Component({
    selector: "bl-activity-monitor",
    templateUrl: "activity-monitor.html",
})
export class ActivityMonitorComponent implements OnInit {
    public static breadcrumb(params, queryParams) {
        return { name: "Activity Monitor" };
    }

    public runningActivities: Activity[];
    public selectSubject: BehaviorSubject<number>;
    public keyDownSubject: BehaviorSubject<KeyboardEvent>;

    constructor(private activityService: ActivityService) {
        this.runningActivities = [];
        this.selectSubject = new BehaviorSubject(0);
        this.keyDownSubject = new BehaviorSubject(null);
    }

    public ngOnInit() {
        this.activityService.incompleteActivities.subscribe(activities => {
            this.runningActivities = activities;
        });
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }

    /* Key Navigation */
    @HostListener("window:keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {
        this.keyDownSubject.next(event);
    }
}
