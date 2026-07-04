import { Component } from "@angular/core";

@Component({
    standalone: false,
    selector: "bl-button-group",
    template: `
        <ng-content></ng-content>
    `,
})
export class ButtonGroupComponent {
}
