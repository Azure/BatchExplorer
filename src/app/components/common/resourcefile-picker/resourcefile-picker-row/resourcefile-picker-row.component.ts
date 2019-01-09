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
    public file: ResourceFileAttributes;

    private _propagateFn: (value: ResourceFileAttributes) => void;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.form = new FormGroup({
            filePath: new FormControl(""),
            httpUrl: new FormControl(""),
        });

        this.form.valueChanges.subscribe(() => {
            this._propagateChange();
        });
    }

    public writeValue(file: ResourceFileAttributes): void {
        this._computeType(file);
        console.log("new row", file);
        this.file = file;
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

    public updateSource(file: ResourceFileAttributes) {
        this.file = { ...this.file, ...file };
    }

    private _propagateChange() {
        if (!this._propagateFn) { return; }
        const formValue = this.form.value;
        switch (this.type) {
            case ResourceFileType.Url:
                this._propagateFn({ filePath: formValue.filePath, httpUrl: formValue.httpUrl });
                break;
            case ResourceFileType.Container:
                if (this.file.storageContainerUrl) {
                    this._propagateFn({
                        filePath: formValue.filePath,
                        blobPrefix: this.file.blobPrefix,
                        storageContainerUrl: this.file.storageContainerUrl,
                    });
                } else {
                    this._propagateFn({
                        filePath: formValue.filePath,
                        blobPrefix: this.file.blobPrefix,
                        autoStorageContainerName: this.file.autoStorageContainerName,
                    });
                }
                break;
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
