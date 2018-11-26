import { ChangeDetectionStrategy, Component } from "@angular/core";

import "./property-list.scss";

@Component({
    selector: "bl-property-list",
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyListComponent {
}
