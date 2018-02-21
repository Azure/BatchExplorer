import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";

import "./property-content.scss";

@Component({
    selector: "bl-property-content",
    templateUrl: "property-content.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyContentComponent {
    @Input() @HostBinding("class.wrap") public wrap = false;
}
