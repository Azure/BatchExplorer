import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from "@angular/forms";

import { FormPageComponent } from "../form-page";

import "./form-picker.scss";

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

    @Output()
    public pick = new EventEmitter();

    @Output()
    public clear = new EventEmitter();

    @Output()
    public open = new EventEmitter();

    @Input()
    public nestedValue = new FormControl();

    public hasValue = false;

    @ViewChild("button")
    private _button: ElementRef;

    @ViewChild("page")
    private _page: FormPageComponent;

    private _propagateChange: (value: any) => void;

    public openPicker() {
        const page = this._getPage();
        page.activate(this);
        this.open.emit();
    }

    public clearPicker(event: MouseEvent) {
        event.stopPropagation();
        this.nestedValue.setValue(null);
        const page = this._getPage();
        this.hasValue = false;
        if (page) {
            page.formGroup.reset();
        }
        this.clear.emit();
    }

    public nestedFormSubmit() {
        this.hasValue = Boolean(this.nestedValue.value);
        if (this._propagateChange) {
            this._propagateChange(this.nestedValue.value);
        }
        this.pick.emit();
    }

    public nestedFormCanceled() {
        // TODO
    }

    public focus() {
        this._button.nativeElement.focus();
    }

    public writeValue(value: any) {
        this.hasValue = Boolean(value);
        this.nestedValue.setValue(value);
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

    private _getPage() {
        return this.page || this._page;
    }
}
