import {
    Component, ContentChildren, EventEmitter, Inject, Input, Output, QueryList, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";

import { AbstractControl } from "@angular/forms";
import { CreateFormComponent } from "./create-form.component";
import { FormPickerComponent } from "./form-picker.component";
import { FormSectionComponent } from "./form-section.component";

@Component({
    selector: "bl-form-page",
    templateUrl: "form-page.html",
})
export class FormPageComponent {
    @Input()
    public title: string;

    @Input()
    public subtitle: string;

    @Input()
    public formGroup: AbstractControl;

    @Output()
    public cancel = new EventEmitter();

    @Output()
    public submit = new EventEmitter();

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @ContentChildren(FormSectionComponent)
    public sections: QueryList<FormSectionComponent>;

    public openedWith: FormPickerComponent;

    // tslint:disable-next-line:no-forward-ref
    constructor( @Inject(forwardRef(() => CreateFormComponent)) private form: CreateFormComponent) { }

    public activate(picker?: FormPickerComponent) {
        this.openedWith = picker;
        this.form.openPage(this);
    }
}
