import { ChangeDetectionStrategy, Component, ElementRef, Input, TemplateRef, ViewChild } from "@angular/core";

import { KeyNavigableListItem } from "@batch-flask/core";
import "./option.scss";

@Component({
    selector: "bl-option",
    templateUrl: "option.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionComponent implements KeyNavigableListItem {
    @Input() public value: string;

    /**
     * What is searchable
     */
    @Input() public label: string;

    @Input() public disabled: boolean;

    @ViewChild(TemplateRef) public content: TemplateRef<any>;

    constructor(private _element: ElementRef) {
    }

    public getLabel(): string {
        if (this.label) {
            return this.label;
        } else {
            return this._readContent();
        }
    }

    private _readContent() {
        return (this._getHostElement().textContent || "").trim();
    }

    /** Gets the host DOM element. */
    private _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }
}
