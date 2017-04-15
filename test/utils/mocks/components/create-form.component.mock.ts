import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-create-form",
    template: `
        <bl-server-error [error]="error"></bl-server-error>
        <ng-content></ng-content>
    `,
})
export class CreateFormMockComponent {
}

@Component({
    selector: "bl-form-page",
    template: `
        <h2>{{title}}</h2>
        <p>{{subtitle}}</p>
        <ng-content></ng-content>
    `,
})
export class FormPageMockComponent {
    @Input()
    public title: string;
    @Input()
    public subtitle: string;
}

export const createFormMockComponents = [CreateFormMockComponent, FormPageMockComponent];
