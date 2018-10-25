import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import "./property-field.scss";

let idCounter = 0;

@Component({
    selector: "bl-property-field",
    templateUrl: "property-field.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFieldComponent {
    @Input() public id = `bl-property-field-${idCounter++}`;

    public get ariaDescribedBy() {
        return `${this.id}_describe`;
    }

    public get labelId() { return `${this.id}_label`; }

    public focusContent(event: FocusEvent) {
        window.getSelection().selectAllChildren(event.target as any);
    }
}
