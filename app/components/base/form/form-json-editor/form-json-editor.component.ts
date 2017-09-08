import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import "./form-json-editor.scss";

@Component({
    selector: "bl-form-json-editor",
    templateUrl: "form-json-editor.html",
    providers: [
        // tslint:disable-next-line:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormJsonEditorComponent), multi: true },
    ],
})
export class FormJsonEditorComponent implements ControlValueAccessor {
    public value: string = "{\n}\n";

    public editorConfig: CodeMirror.EditorConfiguration = {
        lineNumbers: true,
        mode: "application/json",
        tabSize: 2,
        indentUnit: 2,
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
    };

    private _propagateChange: any;
    private _propagateTouched: any;

    public valueChange(newValue: string) {
        this.value = newValue;
        if (this._propagateChange) {
            this._propagateChange(newValue);
        }
    }

    public writeValue(value: string): void {
        this.value = value;
    }
    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this._propagateTouched = fn;
    }
}
