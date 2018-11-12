import { Component, Type, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    selector: "bl-autoscale-formula-picker",
    template: "",
})
export class MockControlValueAccessorComponent<T> implements ControlValueAccessor {
    public value: any;
    private _change: any;

    public writeValue(value: any): void {
        this.value = value;
    }

    public updateValue(value: T): void {
        if (value !== this.value) {
            if (this._change) {
                this._change(value);
            }
        }
    }

    public registerOnChange(fn: any): void {
        this._change = fn;
    }

    public registerOnTouched(fn: any): void {
        // nothing
    }
}

/**
 * Function to simplify control value accessor mocks in tests.
 * This should ONLY be used in tests. It doesn't work with AOT in production build
 */
export function controlValueAccessorProvider(callback: () => Type<any>) {
    return { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(callback), multi: true };
}
