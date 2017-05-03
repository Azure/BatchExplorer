import {
    Component, ContentChild, Input, TemplateRef, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";

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

    public values: FormControl[];
    public currentEditValue = new FormControl(null);
    public hasValue = false;

    private _propagateChange: (value: any) => void;

    constructor(formBuilder: FormBuilder) {
        this.values = [new FormControl(null)];
    }

    public writeValue(value: any) {
        this.values = [...value, new FormControl(null)];
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

    public openPicker(index: number) {
        const control = this.values[index];
        this.currentEditValue.setValue(control.value);
    }

    public pickedValue(index: number) {
        const values = this.values;
        values[index].setValue(this.currentEditValue.value);

        if (index === this.values.length - 1) {
            values.push(new FormControl(null));
        }
        this.values = values;
        this.currentEditValue.setValue(null);
        this._emitNewValue();
        console.log("Values", values);
    }

    /**
     * Means the picker at the given index should be removed
     */
    public clearValue(index: number) {
        this.values.splice(index, 1);
        this.currentEditValue.setValue(null);
        this._emitNewValue();
    }

    private _emitNewValue() {
        if (!this._propagateChange) {
            return;
        }
        this._propagateChange(this.values.map(x => x.value).filter(x => x !== null));
    }
}
