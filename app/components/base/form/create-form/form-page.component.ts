import { Component, Inject, Input, TemplateRef, ViewChild, forwardRef } from "@angular/core";

import { CreateFormComponent } from "./create-form.component";

@Component({
    selector: "bl-form-page",
    templateUrl: "form-page.html",
})
export class FormPageComponent {
    @Input()
    public name: string;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    // tslint:disable-next-line:no-forward-ref
    constructor( @Inject(forwardRef(() => CreateFormComponent)) private form: CreateFormComponent) { }

    public activate() {
        this.form.openPage(this);
    }

}
