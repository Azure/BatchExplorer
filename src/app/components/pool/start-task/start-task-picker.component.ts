import { Component, Input, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";
import { UserAccount, VirtualMachineConfiguration } from "app/models";
import { List } from "immutable";

@Component({
    selector: "bl-start-task-picker",
    templateUrl: "start-task-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StartTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => StartTaskPickerComponent), multi: true },
    ],
})
export class StartTaskPickerComponent implements ControlValueAccessor {
    @Input() public userAccounts: List<UserAccount> | UserAccount[];
    @Input() public virtualMachineConfiguration: VirtualMachineConfiguration = null;

    public form: FormGroup;

    private _propagateChange: (value: any) => void = null;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            commandLine: ["", Validators.required],
            maxTaskRetryCount: [0],
            userIdentity: [null],
            waitForSuccess: [true],
            resourceFiles: [[]],
            environmentSettings: [[]],
            containerSettings: [null],
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
            this.reset();
        }
    }

    public reset() {
        this.form.reset({
            maxTaskRetryCount: 0,
            waitForSuccess: false,
        });
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
                startTaskPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }

        return null;
    }
}
