import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-simple-form",
    template: `
        <div>{{title}}</div>
        <bl-server-error [error]="error"></bl-server-error>
        <ng-content></ng-content>
    `,
})
export class SimpleFormMockComponent {
    @Input()
    public title: string;
}
