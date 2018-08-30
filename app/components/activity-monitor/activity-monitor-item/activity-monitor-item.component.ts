import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { Activity, ActivityService, ActivityStatus } from "@batch-flask/ui/activity-monitor";
import { Subscription } from "rxjs";

import "./activity-monitor-item.scss";

@Component({
    selector: "bl-activity-monitor-item",
    templateUrl: "activity-monitor-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorItemComponent implements OnInit, OnDestroy {
    @Input() public activity: Activity;
    @Input() public focused: boolean;
    @Input() public indent: number;
    @Output() public toggleExpanded = new EventEmitter<void>();

    public progress: number;
    public statusOptions = ActivityStatus;
    public showSubactivities: boolean;
    public subactivitiesShown: number;
    public showError: boolean;
    public expanded: boolean;

    private _status: ActivityStatus;
    private _flashId: number;
    private _sub: Subscription;
    private _progressString: string;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activityService: ActivityService,
    ) {}

    /* Angular Life Cycle Functions*/

    public ngOnInit() {
        this._status = null;
        // default to 10 visible subactivities
        this.subactivitiesShown = 10;
        this.showSubactivities = false;
        this.showError = false;
        this._sub = this.activity.statusSubject.subscribe(status => {
            this._status = status;
            this.changeDetector.markForCheck();
        });
        this._sub.add(this.activity.progress.subscribe((progress) => {
            this.progress = progress;
            this._progressString = `(${Math.floor(progress)}%)`;
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    /* Template Getters */

    public get paddingLeft() {
        return `${this.indent * 30}px`;
    }

    public get subactivities() {
        return this.activity.subactivities.slice(0, this.subactivitiesShown);
    }

    public get status() {
        return this._status;
    }

    public get shouldFlash() {
        return this.activity.id === this._flashId;
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }

    public prettyPrint() {
        if (this.activity.name.length < 200) {
            return `${this.activity.name} ${this._progressString}`;
        } else {
            return `${this.activity.name.slice(0, 200)}... ${this._progressString}`;
        }
    }

    /* Change-of-state Functions */

    public toggleExpand() {
        this.expanded = !this.expanded;
        this.toggleExpanded.emit();
    }

    public toggleShowError() {
        this.showError = !this.showError;
    }

    public cancel() {
        this.activityService.cancel(this.activity);
    }

    public rerun() {
        this.activityService.rerun(this.activity);
    }

    public showLess() {
        if (this.subactivitiesShown > 0) {
            this.subactivitiesShown = Math.max(this.subactivitiesShown - 10, 0);
        }
        if (this.subactivitiesShown === 0) {
            this._collapse();
        }
    }

    public showMore() {
        if (this.subactivitiesShown < this.activity.subactivities.length) {
            this.subactivitiesShown = Math.min(this.subactivitiesShown + 10, this.activity.subactivities.length);
        }
    }

    private _expand() {
        if (this.activity.subactivities.length === 0) { return; }
        this.subactivitiesShown = 10;
        this.showSubactivities = true;
        this.changeDetector.markForCheck();
    }

    private _collapse() {
        this.showSubactivities = false;
        this.changeDetector.markForCheck();
    }
}
