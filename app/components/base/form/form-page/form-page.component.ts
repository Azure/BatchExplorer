import {
    Component, ContentChildren, EventEmitter, Inject, Input, Output, QueryList,
    TemplateRef, ViewChild, forwardRef,
} from "@angular/core";

import { AbstractControl } from "@angular/forms";
import { ComplexFormComponent } from "../complex-form";
import { FormPickerComponent } from "../form-picker";
import { FormSectionComponent } from "../form-section";

import "./form-page.scss";

@Component({
    selector: "bl-form-page",
    templateUrl: "form-page.html",
})
export class FormPageComponent {
    /**
     * Title of the page. It will be shown when this page is the current page of a form.
     */
    @Input()
    public title: string;

    /**
     * Subtitle of the page. It will be shown when this page is the current page of a form.
     */
    @Input()
    public subtitle: string;

    @Input()
    public formGroup: AbstractControl;

    /**
     * Event that will trigger when user click cancel or back.
     */
    @Output()
    public cancel = new EventEmitter();

    /**
     * Event that will trigger when user click select or submit.
     */
    @Output()
    public submit = new EventEmitter();

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @ContentChildren(FormSectionComponent)
    public sections: QueryList<FormSectionComponent>;

    /**
     * Reference to the picker that opened the page if applicable
     */
    public openedWith: FormPickerComponent;

    // tslint:disable-next-line:no-forward-ref
    constructor( @Inject(forwardRef(() => ComplexFormComponent)) private form: ComplexFormComponent) { }

    /**
     * Open the given page. It will push on top of the page stack.
     * @param picker If opening from a picker
     */
    public activate(picker?: FormPickerComponent) {
        this.openedWith = picker;
        this.form.openPage(this);
    }
}
