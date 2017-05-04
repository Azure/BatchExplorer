import {
    Component, ContentChild, Input, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";

import { FormPageComponent } from "../form-page";


import "./form-multi-picker.scss";

@Component({
    selector: "bl-form-multi-picker",
    templateUrl: "form-multi-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormMultiPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FormMultiPickerComponent), multi: true },
    ],
})
export class FormMultiPickerComponent implements ControlValueAccessor, Validator {
    @Input()
    public name: string;

    @Input()
    public addTitle: string;

    @Input()
    public title: (value: any) => string;

    @ContentChild(TemplateRef)
    public nestedForm: TemplateRef<any>;

    public values: any[];
    public currentEditValue = new FormControl(null);

    public hasValue = false;

    @ViewChild("page")
    private _page: FormPageComponent;

    private _lastOpenedButton: HTMLElement;
    private _propagateChange: (value: any) => void;
    private _currentEditIndex = -1;
    constructor(formBuilder: FormBuilder) {
        this.values = [null];
        this.currentEditValue.valueChanges.subscribe((value) => {
            console.log("Current edit value...", this.currentEditValue.valid, this.currentEditValue.errors, value);

        });
    }

    public writeValue(value: any) {
        this.values = [...value, null];
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


    public focus() {
        if (this._lastOpenedButton) {
            this._lastOpenedButton.focus();
        }
    }

    public openPicker(event: MouseEvent, index: number) {
        this._lastOpenedButton = event.target as HTMLElement;
        this.currentEditValue.setValue(this.values[index]);
        this._currentEditIndex = index;
        this._page.activate(this);
    }

    public nestedFormSubmit() {
        this.pickedValue(this._currentEditIndex);
    }

    public pickedValue(index: number) {
        const values = this.values;
        values[index] = this.currentEditValue.value;

        if (index === this.values.length - 1) {
            values.push(null);
        }
        this.values = values;
        this.currentEditValue.setValue(null);
        this._emitNewValue();
        console.log("Values", values);
    }

    /**
     * Means the picker at the given index should be removed
     */
    public clearValue(event: MouseEvent, index: number) {
        event.stopPropagation();
        this._page.formGroup.reset();
        this.values.splice(index, 1);
        this.currentEditValue.setValue(null);
        this._emitNewValue();
    }

    private _emitNewValue() {
        if (!this._propagateChange) {
            return;
        }
        this._propagateChange(this.values.filter(x => x !== null));
    }
}
