import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from "@angular/core";
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

    /* Angular Life Cycle Functions*/

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

    /* Template Getters */

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

    /* Key Navigation */
    @HostListener("window:keydown", ["$event"])
    public handleKeyDown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case 37:                // left arrow
                this._collapse();
                break;
            case 39:                // right arrow
                this._expand();
                break;
            // case 38:                // up arrow
            //     this.focusPrev(this.activity.id);
            //     break;
            // case 40:                // down arrow
            //     this.focusNext(this.activity.id);
            //     break;
            case 13:                // Enter key
                event.preventDefault();
                event.stopPropagation();
                this.toggleExpand();
                break;
            default:
                break;
        }
    }

    /* Change-of-state Functions */

    public toggleExpand() {
        if (this.selectedId === this.activity.id) {
            this.showSubactivities = !this.showSubactivities;
            if (this.showSubactivities) {
                this._expand();
            } else {
                this._collapse();
            }
        }
    }

    public hover() {
        this.hovering = true;
    }

    public unhover() {
        this.hovering = false;
    }

    /* Event Emitters */

    public select() {
        this.selectedIdChange.emit(this.activity.id);
    }

    // N.B. this extra step seems to be needed, because event propagation
    // doesn't work as expected with multiple layers of two-way binding
    public updateSelected(selectedId) {
        this.selectedId = selectedId;
        this.selectedIdChange.emit(selectedId);
    }

    /* Private Helper Methods */

    private _expand() {
        if (this.selectedId === this.activity.id) {
            this.showSubactivities = true;
        }
    }

    private _collapse() {
        if (this.selectedId === this.activity.id) {
            this.showSubactivities = false;
        }
    }
}
