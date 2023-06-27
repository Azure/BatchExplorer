import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import "./text-property.scss";

@Component({
    selector: "bl-text-property",
    templateUrl: "text-property.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPropertyComponent {
    @Input() public label: string;

    @Input() public value: string;

    @Input() public copyable: boolean = true;
    /**
     * If the value should be wrapped when too long
     */
    @Input() public wrap: boolean = false;
}
