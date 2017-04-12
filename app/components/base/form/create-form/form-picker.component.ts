import { Component, ElementRef, Input, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from "@angular/forms";

import { log } from "app/utils";
import { FormPageComponent } from "./form-page.component";

@Component({
    selector: "bl-form-picker",
    templateUrl: "form-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FormPickerComponent), multi: true },
    ],
})
export class FormPickerComponent implements ControlValueAccessor, Validator {
    @Input()
    public name: string;

    @Input()
    public page: FormPageComponent;

    public nestedValue = new FormControl();
    public hasValue = false;

    @ViewChild("button")
    private _button: ElementRef;

    private _propagateChange: (value: any) => void;

    constructor() {
        this.nestedValue.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
            this.hasValue = Boolean(value);
        });
    }

    public openPicker() {
        if (!this.page) {
            log.error("FormPicker: Page is input is not defined");
        }
        this.page.activate(this);
    }

    public focus() {
        this._button.nativeElement.focus();
    }



    public writeValue(value: any) {
        this.nestedValue.patchValue(value);
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }
}
