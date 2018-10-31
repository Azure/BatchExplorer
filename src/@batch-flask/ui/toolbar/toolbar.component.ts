import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding } from "@angular/core";

import "./toolbar.scss";

@Component({
    selector: "bl-toolbar",
    templateUrl: "toolbar.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
    @HostBinding("attr.role") public readonly role = "toolbar";

    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
