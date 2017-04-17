import { Component } from "@angular/core";

@Component({
    selector: "bl-simple-form",
    template: `
        <bl-server-error [error]="error"></bl-server-error>
        <ng-content></ng-content>
    `,
})
export class ActionFormMockComponent {
}
