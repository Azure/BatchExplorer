import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, Input } from "@angular/core";
import { PropertyContentComponent } from "../property-content";

import "./property-field.scss";

let idCounter = 0;

@Component({
    selector: "bl-property-field",
    templateUrl: "property-field.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFieldComponent implements AfterContentInit {
    @Input() public id = `bl-property-field-${idCounter++}`;

    @ContentChild(PropertyContentComponent, {static: false}) private _content: PropertyContentComponent | undefined;

    public get ariaDescribedByIds() {
        return `${this.id}_describe`;
    }

    public get labelId() { return `${this.id}_label`; }

    public ngAfterContentInit() {
        if (this._content) {
            this._content.ariaLablledby = this.labelId;
            this._content.ariaDescribedBy = this.ariaDescribedByIds;
        }
    }
}
