import { Component, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

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
    public jsonControl = new FormControl(emptyJson, null, this._validJsonConfig);

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

    @autobind()
    private _validJsonConfig(c: FormControl): Observable<any> {
        return Observable.of(null).debounceTime(1000).map(() => {
            try {
                JSON.parse(c.value);
                return null;
            } catch (e) {
                return {
                    validJson: {
                        valid: false,
                        message: e.message,
                    },
                };
            }
        });
    }
}
