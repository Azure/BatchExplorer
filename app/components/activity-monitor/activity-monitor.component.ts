import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { BehaviorSubject, Subscription } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import "./activity-monitor.scss";

@Component({
    selector: "bl-activity-monitor",
    templateUrl: "activity-monitor.html",
})
export class ActivityMonitorComponent implements OnInit, OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "Activity Monitor" };
    }

    public runningActivities: Activity[];
    public pastActivities: Activity[];
    public selectSubject: BehaviorSubject<number>;
    public flashSubject: BehaviorSubject<number>;
    public keyDownSubject: BehaviorSubject<KeyboardEvent>;

    private _sub: Subscription;

    constructor(
        private activityService: ActivityService,
        private route: ActivatedRoute,
    ) {}

    public ngOnInit() {
        this.runningActivities = [];
        this.pastActivities = [];
        this.selectSubject = new BehaviorSubject(-1);
        this.flashSubject = new BehaviorSubject(-1);
        this.keyDownSubject = new BehaviorSubject(null);
        this._sub = this.activityService.incompleteActivities.subscribe(activities => {
            this.runningActivities = activities;
        });
        this._sub.add(this.activityService.history.subscribe(history => {
            this.pastActivities = history;
        }));
        this._sub.add(this.route.params.subscribe(params => {
            if (params && params.id !== undefined) {
                this._flash(params.id);
            }
        }));
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }

    /* Key Navigation */
    @HostListener("window:keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.keyDownSubject.next(event);
    }

    /* Key Navigation */
    @HostListener("window:click", ["$event"])
    public onClick(event: MouseEvent) {
        this.selectSubject.next(-1);
    }

    public cancelAll() {
        this.activityService.cancelMultiple(this.runningActivities);
    }

    public select(id: number) {
        // TODO look for cleaner way to handle propagation issue
        setTimeout(() => this.selectSubject.next(id), 10);
    }

    public jumpQueues(id: number) {
        if (this.pastActivities.length === 0 || this.runningActivities.length === 0) { return; }
        const len = this.runningActivities.length;
        if (this.runningActivities[len - 1].id === id) {
            this.select(this.pastActivities[0].id);
        } else if (this.pastActivities[0].id === id) {
            this.select(this.runningActivities[len - 1].id);
        }
    }

    private _flash(id) {
        if (id !== null) {
            setTimeout(() => {
                this.selectSubject.next(+id);
                this.flashSubject.next(+id);
            }, 10);
        }
    }
}
