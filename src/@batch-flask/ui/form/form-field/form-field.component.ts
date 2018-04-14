import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild } from "@angular/core";

import { FormFieldControl } from "./form-field-control";

import "./form-field.scss";

@Component({
    selector: "bl-form-field",
    templateUrl: "form-field.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements AfterContentInit {
    @ContentChild(FormFieldControl) public control: FormFieldControl<any>;

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    public ngAfterContentInit() {
        if (!this.control) {
            throw new Error("bl-form-field is expecting an control under. This can either be a blInput.");
        }
    }
}
