import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { EditorConfig } from "@batch-flask/ui/editor";

@Component({
    selector: "bl-editor",
    template: `<textarea [value]="value"></textarea>`,
    providers: [
        // tslint:disable-next-line:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MockEditorComponent), multi: true },
    ],
})
export class MockEditorComponent implements ControlValueAccessor {
    @Input() public config: EditorConfig;
    @Input() public set value(v) {
        if (v !== this._value) {
            this.writeValue(v);
        }
    }
    public get value() { return this._value; }

    private _value: string;

    public updateValue(value) {
        this._value = value;
        this.onChange(value);
    }

    public writeValue(value) {
        this._value = value || "";
    }

    public onChange: (value: any) => any = () => null;

    // tslint:disable-next-line:no-empty
    public onTouched() { }
    public registerOnChange(fn) { this.onChange = fn; }
    public registerOnTouched(fn) { this.onTouched = fn; }

}
