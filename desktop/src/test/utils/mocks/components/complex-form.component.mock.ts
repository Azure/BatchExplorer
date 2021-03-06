import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-complex-form",
    template: `
        <bl-server-error [error]="error"></bl-server-error>
        <ng-content></ng-content>
    `,
})
export class ComplexFormMockComponent {
    @Input() public submit: () => any;
    @Input() public containerRef;
    @Input() public formGroup;
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

export const complexFormMockComponents = [ComplexFormMockComponent, FormPageMockComponent];
