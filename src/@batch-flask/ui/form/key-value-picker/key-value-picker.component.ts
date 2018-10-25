import { Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

interface KeyValue {
    name: string;
    value: string;
}

@Component({
    selector: "bl-key-value-picker",
    templateUrl: "key-value-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => KeyValuePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => KeyValuePickerComponent), multi: true },
    ],
})
export class KeyValuePickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public label: string;

    public items: FormControl;

    private _propagateChange: (value: KeyValue[]) => void = null;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.items = formBuilder.control([]);
        this._sub = this.items.valueChanges.subscribe((items) => {
            if (this._propagateChange) {
                this._propagateChange(items);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: KeyValue[]) {
        if (value) {
            this.items.setValue(value);
        }
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
