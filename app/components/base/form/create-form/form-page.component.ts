import { Component, Inject, Input, TemplateRef, ViewChild, forwardRef } from "@angular/core";

import { CreateFormComponent } from "./create-form.component";
import { FormPickerComponent } from "./form-picker.component";

@Component({
    selector: "bl-form-page",
    templateUrl: "form-page.html",
})
export class FormPageComponent {
    @Input()
    public name: string;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    public openedWith: FormPickerComponent;

    // tslint:disable-next-line:no-forward-ref
    constructor( @Inject(forwardRef(() => CreateFormComponent)) private form: CreateFormComponent) { }

    public activate(picker?: FormPickerComponent) {
        this.openedWith = picker;
        this.form.openPage(this);
    }
}
