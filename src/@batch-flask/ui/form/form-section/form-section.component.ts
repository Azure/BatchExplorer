import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bl-form-section",
    templateUrl: "form-section.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionComponent {
    @Input() public title: string;

    @Input() public subtitle: string;

    @ViewChild(TemplateRef, { static: false }) public content: TemplateRef<any>;
}
