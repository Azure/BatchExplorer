import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { UserAccountElevationLevel } from "app/models";
import { UserAccountDto } from "app/models/dtos";

export interface UserAccountFormModel {
    name: string;
    password: string;
    runElevated: boolean;
    sshPrivateKey: string;
}

function userAccountToFormModel(userAccount: UserAccountDto) {
    return {
        name: userAccount.name,
        password: userAccount.password,
        runElevated: userAccount.elevationLevel === "admin",
        sshPrivateKey: userAccount.sshPrivateKey,
    };
}

function userAccountToDto(userAccount: UserAccountFormModel): UserAccountDto {
    return new UserAccountDto({
        name: userAccount.name,
        password: userAccount.password,
        elevationLevel: userAccount.runElevated ? UserAccountElevationLevel.admin : UserAccountElevationLevel.nonadmin,
        sshPrivateKey: userAccount.sshPrivateKey,
    });
}

@Component({
    selector: "bl-user-account-picker",
    templateUrl: "user-account-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserAccountPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => UserAccountPickerComponent), multi: true },
    ],
})
export class UserAccountPickerComponent implements ControlValueAccessor, Validator, OnDestroy {
    public form: FormGroup;

    private _propagateChange: (value: UserAccountDto) => void = null;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            name: ["", Validators.required],
            password: ["", Validators.required],
            runElevated: [false],
        });

        this._sub = this.form.valueChanges.subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(userAccountToDto(val));
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();

    }
    public writeValue(value: UserAccountDto) {
        if (value) {
            this.form.patchValue(userAccountToFormModel(value));
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
                userAccounts: {
                    valid: false,
                },
            };
        }

        return null;
    }
}
