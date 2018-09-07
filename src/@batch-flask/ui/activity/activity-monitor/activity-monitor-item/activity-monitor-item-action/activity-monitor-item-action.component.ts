import { Component, Input } from "@angular/core";

import "./activity-monitor-item-action.scss";

export interface ActivityAction {
    title: string;
    className: string;
    action: () => void;
    faClass: string;
    active: boolean;
    id: number;
}

@Component({
    selector: "bl-activity-monitor-item-action",
    templateUrl: "activity-monitor-item-action.html",
})
export class ActivityMonitorItemActionComponent {
    @Input() public action: ActivityAction;
    @Input() public selected: boolean;

    public hovered: boolean = false;

    // tslint:disable-next-line:no-empty
    constructor() {}

    public hover() {
        this.hovered = true;
    }

    public unhover() {
        this.hovered = false;
    }
}
