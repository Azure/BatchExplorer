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
import { ContainerConfigurationAttributes, ContainerType } from "app/models";
import { ContainerConfigurationDto } from "app/models/dtos";

import "./container-configuration-picker.scss";

@Component({
    selector: "bl-container-configuration-picker",
    templateUrl: "container-configuration-picker.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ContainerConfigurationPickerComponent),
            multi: true,
        },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContainerConfigurationPickerComponent), multi: true },
    ],
})
export class ContainerConfigurationPickerComponent implements ControlValueAccessor {
    public ContainerType = ContainerType;
    public form: FormGroup;
     private _propagateChange: (value: ContainerConfigurationAttributes) => void = null;
     constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            type: [ContainerType.DockerCompatible, Validators.required],
            containerImageNames: [[]],
            containerRegistries: [[]],
        });
        this.form.valueChanges.subscribe((value) => {
            const attributes = new ContainerConfigurationDto({
                type: value.type,
                containerRegistries: value.containerRegistries,
                containerImageNames: value.containerImageNames && value.containerImageNames.map(x => x.imageName),
            });
            if (this._propagateChange) {
                this._propagateChange(attributes);
            }
        });
    }
     public writeValue(value: ContainerConfigurationDto) {
        if (value) {
            this.form.patchValue({
                type: value.type,
                containerImageNames: value.containerImageNames.map(x => ({imageName: x})),
                containerRegistries: value.containerRegistries,
            });
        } else {
            this.form.patchValue({
                type: ContainerType.DockerCompatible,
                containerImageNames: [],
                containerRegistries: [],
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
