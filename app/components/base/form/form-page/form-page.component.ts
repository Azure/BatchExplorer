import {
    Component, ContentChildren, EventEmitter, Inject, Input, Output, QueryList,
    TemplateRef, ViewChild, ViewEncapsulation, forwardRef,
} from "@angular/core";

import { AbstractControl } from "@angular/forms";
import { CreateFormComponent, FormSectionComponent } from "../create-form";
import { FormPickerComponent } from "../form-picker";

@Component({
    selector: "bl-form-page",
    templateUrl: "form-page.html",
    styleUrls: ["form-page.scss"],
    encapsulation: ViewEncapsulation.None,
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
    constructor( @Inject(forwardRef(() => CreateFormComponent)) private form: CreateFormComponent) { }

    /**
     * Open the given page. It will push on top of the page stack.
     * @param picker If opening from a picker
     */
    public activate(picker?: FormPickerComponent) {
        this.openedWith = picker;
        this.form.openPage(this);
    }
}
