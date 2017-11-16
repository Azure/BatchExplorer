import { Component, Input, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";

import { EditorConfig } from "app/components/base/editor";
import { validJsonConfig } from "app/utils/validators";
import "./form-json-editor.scss";

const emptyJson = "{\n\n}";

@Component({
    selector: "bl-form-json-editor",
    templateUrl: "form-json-editor.html",
    providers: [
        // tslint:disable-next-line:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormJsonEditorComponent), multi: true },
    ],
})
export class FormJsonEditorComponent implements ControlValueAccessor, OnDestroy {
    public jsonControl = new FormControl(emptyJson, null, validJsonConfig);

    public editorConfig: EditorConfig = {
        language: "json",
        tabSize: 2,
        minimap: {
            enabled: false,
        },
    };

    @Input()
    public set monacoUri(uri: string) {
        if (uri) {
            this.editorConfig.uri = uri;
        }
    }

    private _propagateChange: any;
    private _propagateTouched: any;
    private _sub: Subscription;

    constructor() {
        this._sub = this.jsonControl.valueChanges.subscribe((value) => {
            this.valueChange(value);
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public valueChange(newValue: string) {
        if (this._propagateChange) {
            this._propagateChange(newValue);
        }
    }

    public writeValue(value: string): void {
        this.jsonControl.setValue(value);
    }
    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this._propagateTouched = fn;
    }
}
