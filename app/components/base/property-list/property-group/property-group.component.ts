import { Component, EventEmitter, Input, Output } from "@angular/core";
import { autobind } from "app/core";

import "./property-group.scss";

@Component({
    selector: "bl-property-group",
    templateUrl: "property-group.html",
})
export class PropertyGroupComponent {
    @Output() public collapsedChange = new EventEmitter();

    /**
     * If a label is specified the group will be collapsable
     */
    @Input() public label: string;

    @Input() public warningMessage: string = null;

    @Input() public collapsable: boolean = true;

    @Input() public edit: () => void;

    @Input() public set collapsed(collapsed) {
        this._collapsed = collapsed;
        this.collapsedChange.emit(collapsed);
    }

    public get collapsed() {
        return this._collapsed;
    }

    private _collapsed = false;

    public toogleCollapsed() {
        if (this.collapsable) {
            this.collapsed = !this.collapsed;
        }
    }

    @autobind()
    public triggerEdit(event: Event) {
        event.stopPropagation();
        this.edit();
    }
}
