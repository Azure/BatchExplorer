import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";

import "./hint.scss";

@Component({
    selector: "bl-hint",
    template: "<ng-content></ng-content>",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintComponent {
    @Input() public align: "start" | "end" = "start";

    @HostBinding("attr.align") public alignRemove = null;
    @HostBinding("class.bl-align-right") public get() {
        return this.align === "end";
    }
}
