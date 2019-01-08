import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output, forwardRef } from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormControl,
    FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";

import { exists } from "@batch-flask/utils";
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
    @Output() public delete = new EventEmitter();

    public ResourceFileType = ResourceFileType;
    public type: ResourceFileType = ResourceFileType.Url;
    public form: FormGroup;

    private _propagateFn: (value: ResourceFileAttributes) => void;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.form = new FormGroup({
            filePath: new FormControl(""),
            httpUrl: new FormControl(""),
        });

        this.form.valueChanges.subscribe((file) => {
            switch (this.type) {
                case ResourceFileType.Url:
                    this._propagateChange({ filePath: file.filePath, httpUrl: file.httpUrl });
                    break;
                case ResourceFileType.Container:
                    this._propagateChange({ filePath: file.filePath, storageContainerUrl: file.storageContainerUrl });
                    break;
            }
        });
    }

    public writeValue(file: ResourceFileAttributes): void {
        console.log("New file", file);
        this._computeType(file);
        this.form.patchValue({
            filePath: file.filePath,
            httpUrl: file.httpUrl,
        });
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

    private _propagateChange(value: ResourceFileAttributes) {
        if (this._propagateFn) {
            this._propagateFn(value);
        }
    }

    private _computeType(file: ResourceFileAttributes) {
        if (exists(file.httpUrl)) {
            this.type = ResourceFileType.Url;
        } else {
            this.type = ResourceFileType.Container;
        }
        this.changeDetector.markForCheck();
    }
}
