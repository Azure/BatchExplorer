import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";
import { Activity, ActivityStatus } from "@batch-flask/ui/activity-monitor";

import "./activity-monitor-item.scss";

@Component({
    selector: "bl-activity-monitor-item",
    templateUrl: "activity-monitor-item.html",
})
export class ActivityMonitorItemComponent implements OnInit, OnChanges {
    @Input() public activity: Activity;
    @Input() public selectedId: number;
    @Input() public indent: number = 0;
    @Input() public hovering: boolean = false;
    @Output() public selectedIdChange = new EventEmitter<number>();

    public statusOptions = ActivityStatus;
    public showSubactivities: boolean;

    private _status: ActivityStatus;

    constructor() {
        this._status = null;
    }

    public ngOnInit() {
        this.activity.statusSubject.subscribe(status => {
            this._status = status;
        });
    }

    public ngOnChanges(changes) {
        if (changes.indent) {
            this.indent = changes.indent.currentValue;
        }
        if (changes.hovering) {
            this.hovering = changes.hovering.currentValue;
        }
    }

    public get subactivities() {
        return this.activity.subactivities;
    }

    public get status() {
        return this._status;
    }

    public get finished() {
        return this._status === ActivityStatus.Completed ||
            this.status === ActivityStatus.Failed ||
            this.status === ActivityStatus.Canceled;
    }

    public get selected() {
        return this.activity.id === this.selectedId;
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }

    public getIndent() {
        return (this.indent * 30) + "px";
    }

    public toggleExpand() {
        this.showSubactivities = !this.showSubactivities;
    }

    public hover() {
        this.hovering = true;
    }

    public unhover() {
        this.hovering = false;
    }

    public select() {
        this.selectedIdChange.emit(this.activity.id);
    }

    // N.B. this extra step seems to be needed, because event propagation
    // doesn't work as expected with multiple layers of two-way binding
    public updateSelected(selectedId) {
        this.selectedId = selectedId;
        this.selectedIdChange.emit(selectedId);
    }
}
