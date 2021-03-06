import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input } from "@angular/core";

import "./property-content.scss";

@Component({
    selector: "bl-property-content",
    templateUrl: "property-content.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyContentComponent {
    @Input() @HostBinding("class.wrap") public wrap = false;

    @HostBinding("attr.role") public readonly role = "textbox";
    @HostBinding("attr.aria-readonly") public readonly ariaReadonly = true;
    @HostBinding("attr.aria-labelledby") public ariaLablledby = null;
    @HostBinding("attr.aria-describedby") public ariaDescribedBy = null;
    @HostBinding("attr.tabindex") public readonly tabindex = 0;
    @HostBinding("class.focus-outline") public readonly focusOutlineCls = true;

    @HostListener("focus", ["$event"])
    public handleFocus(event: FocusEvent) {
        window.getSelection().selectAllChildren(event.target as any);
    }
}
