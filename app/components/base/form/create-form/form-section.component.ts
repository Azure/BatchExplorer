import { Component, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bl-form-section",
    templateUrl: "form-section.html",
})
export class FormSectionComponent {
    @Input()
    public name: string;

    @Input()
    public subtitle: string;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}
