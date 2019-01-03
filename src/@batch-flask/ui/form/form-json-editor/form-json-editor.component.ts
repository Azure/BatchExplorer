import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { EditorConfig } from "@batch-flask/ui/editor";
import { validJsonConfig } from "@batch-flask/utils/validators";
import { Subscription } from "rxjs";

import "./form-json-editor.scss";

const emptyJson = "{\n\n}";

@Component({
    selector: "bl-form-json-editor",
    templateUrl: "form-json-editor.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormJsonEditorComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormJsonEditorComponent implements ControlValueAccessor, OnDestroy {
    public jsonControl = new FormControl(emptyJson, null, validJsonConfig);

    public editorConfig: EditorConfig;

    @Input()
    public set fileUri(uri: string) {
        this._fileUri = uri;
    }

    private _fileUri: string;
    private _propagateChange: any;
    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {
        this._sub = this.jsonControl.valueChanges.subscribe((value) => {
            this.valueChange(value);
        });
        this._computeOptions();
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
        // Nothing
    }

    private async _computeOptions() {
        const { Uri } = await import("monaco-editor");

        this.editorConfig = {
            language: "json",
            tabSize: 2,
            minimap: {
                enabled: false,
            },
            uri: this._fileUri && Uri.file(this._fileUri),
        };
        this.changeDetector.markForCheck();
    }
}
