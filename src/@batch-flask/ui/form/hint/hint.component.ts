import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";

import "./hint.scss";

let idCounter = 0;

@Component({
    selector: "bl-hint",
    template: "<ng-content></ng-content>",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintComponent {
    /** Unique ID for the hint. Used for the aria-describedby on the form field control. */
    @Input() @HostBinding("attr.id") public id: string = `bl-hint-${idCounter++}`;

    @Input() public align: "start" | "end" = "start";

    @HostBinding("attr.align") public alignRemove = null;

    @HostBinding("class.bl-align-right") public get alignRight() {
        return this.align === "end";
    }
}
