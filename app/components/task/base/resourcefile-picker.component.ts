import { Component, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";

import { ResourceFile } from "app/models";

// tslint:disable:no-forward-ref

@Component({
    selector: "bl-resourcefile-picker",
    templateUrl: "resourcefile-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
    ],
})
export class ResourcefilePickerComponent implements ControlValueAccessor {
    public form: FormGroup;
    public files: FormArray;

    private _propagateChange: (value: ResourceFile[]) => void = null;

    constructor(private formBuilder: FormBuilder) {
        this.files = this.formBuilder.array([]);
        this.form = this.formBuilder.group({
            files: this.files,
        });
        this.files.valueChanges.subscribe((files) => {
            if (this._propagateChange) {
                this._propagateChange(files);
            }
        });
    }

    public addResourceFile() {
        this.files.push(this.formBuilder.group({
            blobSource: "",
            filePath: "",
        }));
    }

    public deleteFile(index) {
        this.files.removeAt(index);
    }

    public writeValue(value: ResourceFile[]) {
        if (value) {
            this.files.controls = value.map((file) => {
                return this.formBuilder.group({
                    blobSource: file.blobSource,
                    filePath: file.filePath,
                });
            });
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
