import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { Subscription } from "rxjs";
import { Activity, ActivityStatus } from "../../activity-types";
import { ActivityService } from "../../activity.service";
import { ActivityAction } from "./activity-monitor-item-action";

import "./activity-monitor-item.scss";

@Component({
    selector: "bl-activity-monitor-item",
    templateUrl: "activity-monitor-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorItemComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public activity: Activity;
    @Input() public focused: boolean;
    @Input() public flash: boolean;
    @Input() public hovered: boolean;
    @Input() public indent: number;
    @Input() public expanded: boolean;
    @Input() public focusedAction: number;
    @Output() public toggleRowExpand = new EventEmitter<void>();
    @Output() public focusedActionChange = new EventEmitter<number>();

    public progress: number;
    public progressString: string;
    public statusOptions = ActivityStatus;
    public showSubactivities: boolean;
    public subactivitiesShown: number;
    public showError: boolean;
    public actions: ActivityAction[];

    private _status: ActivityStatus;
    private _flashId: number;
    private _subs: Subscription[];

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
        this._subscribeToSubjects();
    }

    public ngOnChanges(changes) {
        // on changes, clear subscriptions and reset them
        if (this._subs) {
            this._unsubscribeFromSubjects();
        }
        this._subscribeToSubjects();

        this._setActions();

        // clamp focusedAction to the max number of actions
        if (changes.focusedAction && this.focused && changes.focusedAction.currentValue > this.actions.length - 1) {
            this.focusedAction = this.actions.length - 1;
            this.focusedActionChange.emit(this.actions.length - 1);
        }
    }

    public ngOnDestroy() {
        this._unsubscribeFromSubjects();
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
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

    /* Change-of-state Functions */

    public toggleExpand() {
        this.expanded = !this.expanded;
        this.toggleRowExpand.emit();
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
            // this._collapse();
        }
    }

    public showMore() {
        if (this.subactivitiesShown < this.activity.subactivities.length) {
            this.subactivitiesShown = Math.min(this.subactivitiesShown + 10, this.activity.subactivities.length);
        }
    }

    public execAction() {
        // execute the focused action
        this.actions[this.focusedAction].action();
    }

    public actionTrackBy(action: ActivityAction) {
        return action.id;
    }

    private _subscribeToSubjects() {
        this._subs = [];
        this._subs.push(this.activity.statusSubject.subscribe(status => {
            this._status = status;
            this.changeDetector.markForCheck();
        }));
        this._subs.push(this.activity.progress.subscribe((progress) => {
            this.progress = progress;
            const nonnegative = progress > 0 ? progress : 0;
            this.progressString = `(${Math.floor(nonnegative)}%)`;
            this.changeDetector.markForCheck();
        }));
    }

    private _unsubscribeFromSubjects() {
        this._subs.forEach(sub => sub.unsubscribe());
    }

    private _setActions(): void {
        let idCounter = 0;
        // TODO find a more extensible way to do this
        const actions: ActivityAction[] = [
            {
                title: "Cancel",
                className: "cancel",
                action: () => this.cancel(),
                active: this.activity.isCancellable && !this.activity.isComplete,
                faClass: "fa-times",
                id: idCounter++,
            },
            {
                title: "Rerun",
                className: "rerun",
                action: () => this.rerun(),
                active: this.activity.isComplete,
                faClass: "fa-refresh",
                id: idCounter++,
            },
        ];

        this.actions = actions.filter(action => action.active);
    }
}
