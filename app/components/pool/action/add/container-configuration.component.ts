import { Component, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    Validators,
} from "@angular/forms";

import { ContainerType } from "app/models";

import "./container-configuration.scss";

@Component({
    selector: "bl-container-configuration",
    templateUrl: "container-configuration.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ContainerConfigurationComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContainerConfigurationComponent), multi: true },
    ],
})
export class ContainerConfigurationComponent implements ControlValueAccessor {
    public ContainerType = ContainerType;
    public form: FormGroup;

    private _propagateChange: (value: any) => void = null;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            type: [null, Validators.required],
            containerImageNames: [[], Validators.required],
            containerRegistries: [[]],
        });

        this.form.valueChanges.subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(val);
            }
        });
    }

    public writeValue(value: any) {
        if (value) {
            this.form.patchValue(value);
        } else {
            this.form.reset();
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (!valid) {
            return {
                ContainerConfigurationComponent: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }
        return null;
    }
}
