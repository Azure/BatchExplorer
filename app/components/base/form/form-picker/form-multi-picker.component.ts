import {
    Component, ContentChild, Directive, Input, TemplateRef, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";

@Directive({
    selector: "[nested-form]",
})
export class NestedFormDirective {

}

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
    public title: (value: any) => string;

    @ContentChild(TemplateRef)
    public nestedForm: TemplateRef<any>;

    public values: FormArray;
    public currentEditValue = new FormControl(null);
    public hasValue = false;

    private _propagateChange: (value: any) => void;

    constructor(formBuilder: FormBuilder) {
        this.values = formBuilder.array([null]);
        this.values.valueChanges.subscribe((newValues) => {
            console.log("new values", newValues);
        });
    }

    public ngAfterViewInit() {
        console.log("nsform", this.nestedForm);
    }

    public writeValue(value: any) {
        // TODO
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
        const value = this.values.value[index];
        this.currentEditValue.setValue(value);
    }

    public pickedValue(index: number) {
        const value = this.values.value;
        value[index] = this.currentEditValue.value;
        this.values.patchValue(value);

        if (index === this.values.length - 1) {
            this.values.push(new FormControl(null));
        }
    }

    /**
     * Means the picker at the given index should be removed
     */
    public clearValue(index: number) {
        this.values.removeAt(index);
    }
}
