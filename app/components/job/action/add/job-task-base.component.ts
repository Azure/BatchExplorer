import { Input } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";

import { RangeValidator } from "@batch-flask/ui/validation";
import { UserAccount, VirtualMachineConfiguration } from "app/models";
import { Constants } from "common";
import { List } from "immutable";

export class JobTaskBaseComponent implements ControlValueAccessor {
    @Input() public userAccounts: List<UserAccount> | UserAccount[];
    @Input() public virtualMachineConfiguration: VirtualMachineConfiguration;

    public form: FormGroup;
    public constraintsGroup: FormGroup;
    protected _propagateChange: (value: any) => void = null;
    protected _baseFormControls: any;
    protected _defaultValue: any;
    protected _invalidResponse: any;
    constructor(formBuilder: FormBuilder, defaultValue: any, invalidResponse: any) {
        const validation = Constants.forms.validation;
        this.constraintsGroup = formBuilder.group({
            maxWallClockTime: null,
            retentionTime: null,
            maxTaskRetryCount: [
                0,
                new RangeValidator(validation.range.retry.min, validation.range.retry.max).validator,
            ],
        });

        this._baseFormControls = {
            id: ["", Validators.required],
            commandLine: ["", Validators.required],
            constraints: this.constraintsGroup,
            userIdentity: [null],
            resourceFiles: [[]],
            environmentSettings: [[]],
            containerSettings: [[]],
        };

        this._defaultValue = defaultValue;
        this._invalidResponse = invalidResponse;
    }

    public writeValue(value: any) {
        if (value) {
            this.form.patchValue(value);
        } else {
            this.reset();
        }
    }

    public reset() {
        this.form.reset(this._defaultValue);
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
            return this._invalidResponse;
        }
        return null;
    }
}
