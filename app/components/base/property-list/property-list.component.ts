import { Component } from "@angular/core";

import "./property-list.scss";

@Component({
    selector: "bl-property-list",
    template: `<fieldset><ng-content></ng-content></fieldset>`,
})
export class PropertyListComponent {
}
