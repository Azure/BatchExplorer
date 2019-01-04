import {
    ChangeDetectorRef, Component, ContentChild, Directive,
    ElementRef, Input, QueryList, TemplateRef, ViewChild, ViewChildren, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";

import { FormPageComponent } from "../form-page";

import "./form-multi-picker.scss";

@Directive({
    selector: "[blFormPickerItem]",
})
export class FormPickerItemTemplateDirective {
    @ContentChild(TemplateRef)
    public template: TemplateRef<any>;
}

@Component({
    selector: "bl-form-multi-picker",
    templateUrl: "form-multi-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormMultiPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FormMultiPickerComponent), multi: true },
    ],
})
export class FormMultiPickerComponent implements ControlValueAccessor, Validator {
    @Input() public name: string;

    @Input() public addTitle: string;

    @Input() public title: (value: any) => string;

    /**
     * If the picker should not have more than x values
     */
    @Input() public max = -1;

    @ContentChild(FormPickerItemTemplateDirective)
    public itemTemplate: FormPickerItemTemplateDirective;

    public values: any[];
    public currentEditValue = new FormControl(null);

    public hasValue = false;

    @ViewChild("page")
    private _page: FormPageComponent;

    @ViewChildren("button")
    private _buttons: QueryList<ElementRef>;

    private _propagateChange: (value: any) => void;
    private _registerTouched: () => void;

    private _currentEditIndex = -1;
    constructor(private changeDetector: ChangeDetectorRef) {
        this.values = [null];
    }

    public writeValue(value: any) {
        this.values = [...value, null];
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn) {
        this._registerTouched = fn;
    }

    public validate(c: FormControl) {
        return null;
    }

    public focus() {
        const button = this._buttons.toArray()[this._currentEditIndex];
        if (button) {
            button.nativeElement.focus();
        }
    }

    public openPicker(event: MouseEvent, index: number) {
        this.currentEditValue.setValue(this.values[index]);
        this._currentEditIndex = index;
        this._page.activate(this);
        this.changeDetector.markForCheck();
    }

    public nestedFormSubmit() {
        this.pickedValue(this._currentEditIndex);
    }

    public pickedValue(index: number) {
        const values = this.values;
        values[index] = this.currentEditValue.value;

        if (index === this.values.length - 1) {
            if (this.max === -1 || index < this.max - 1) {
                values.push(null);
            }
        }
        this.values = values;
        this.currentEditValue.setValue(null);
        this._emitNewValue();
        if (this._registerTouched) {
            this._registerTouched();
        }
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

    public trackByFn(index) {
        return index;
    }

    private _emitNewValue() {
        if (!this._propagateChange) {
            return;
        }
        this._propagateChange(this.values.filter(x => x !== null));
    }
}
