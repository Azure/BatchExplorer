import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "bex-property-group",
    templateUrl: "property-group.html",
})
export class PropertyGroupComponent {
    @Output()
    public collapsedChange = new EventEmitter();

    @Input()
    public label: string;

    @Input()
    public warningMessage: string = null;

    @Input()
    public set collapsed(collapsed) {
        this._collapsed = collapsed;
        this.collapsedChange.emit(collapsed);
    }

    public get collapsed() {
        return this._collapsed;
    }

    private _collapsed = false;

    public toogleCollapsed() {
        this.collapsed = !this.collapsed;
    }
}
