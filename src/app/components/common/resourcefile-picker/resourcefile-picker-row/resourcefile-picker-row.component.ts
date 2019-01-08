import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormControl,
    FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";

import { ResourceFileAttributes } from "app/models";
import "./resourcefile-picker-row.scss";

enum ResourceFileType {
    Url,
    Container,
}
@Component({
    selector: "bl-resourcefile-picker-row",
    templateUrl: "resourcefile-picker-row.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ResourceFilePickerRowComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ResourceFilePickerRowComponent), multi: true },
    ],
})
export class ResourceFilePickerRowComponent implements ControlValueAccessor, Validator {
    public ResourceFileType = ResourceFileType;
    public type: ResourceFileType = ResourceFileType.Url;
    public form: FormGroup;

    private _propagateFn: (value: ResourceFileAttributes) => void;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.form = new FormGroup({
            localPath: new FormControl(""),
        });
    }

    public registerOnValidatorChange?(fn: () => void): void {
        throw new Error("Method not implemented.");
    }

    public writeValue(file: ResourceFileAttributes): void {
        this._computeType(file);
    }

    public registerOnChange(fn: (value: ResourceFileAttributes) => void): void {
        this._propagateFn = fn;
    }

    public registerOnTouched(fn: any): void {
        // TODO
    }

    public validate(control: AbstractControl): ValidationErrors | null {
        return null;
    }

    private _propagateChanges(value: ResourceFileAttributes) {
        if (this._propagateFn) {
            this._propagateFn(value);
        }
    }

    private _computeType(file: ResourceFileAttributes) {
        if (file.httpUrl) {
            this.type = ResourceFileType.Url;
        } else {
            this.type = ResourceFileType.Container;
        }
        this.changeDetector.markForCheck();
    }
}
