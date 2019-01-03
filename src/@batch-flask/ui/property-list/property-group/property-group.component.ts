import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { autobind } from "@batch-flask/core";

import "./property-group.scss";

let idCounter = 0;

@Component({
    selector: "bl-property-group",
    templateUrl: "property-group.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyGroupComponent {
    @Input() public id = `bl-property-group-${idCounter++}`;

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

    public get contentId() { return `${this.id}_content`; }

    public get collapsed() { return this._collapsed; }

    private _collapsed = false;

    constructor(private changeDetector: ChangeDetectorRef) { }

    public toogleCollapsed() {
        this.changeDetector.markForCheck();

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
