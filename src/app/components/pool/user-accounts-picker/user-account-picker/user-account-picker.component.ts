import { ChangeDetectionStrategy, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators,
} from "@angular/forms";
import { LoginMode, OSType, UserAccountElevationLevel } from "app/models";
import { UserAccountDto } from "app/models/dtos";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

export interface UserAccountFormModel {
    name: string;
    password: string;
    runElevated: boolean;
    windowsUserConfiguration?: {
        loginMode?: LoginMode;
    },
    linuxUserConfiguration?: {
        sshPrivateKey?: string;
        gid?: number;
        uid?: number;
    }
}

function userAccountToFormModel(userAccount: UserAccountDto): UserAccountFormModel {
    const value: UserAccountFormModel = {
        name: userAccount.name,
        password: userAccount.password,
        runElevated: userAccount.elevationLevel === "admin",
    };

    if (userAccount.linuxUserConfiguration) {
        value.linuxUserConfiguration = userAccount.linuxUserConfiguration;
    }
    if (userAccount.windowsUserConfiguration) {
        value.windowsUserConfiguration = userAccount.windowsUserConfiguration;
    }
    return value;
}

function userAccountToDto(value: UserAccountFormModel, osType: OSType): UserAccountDto {
    const commonProperties = {
        name: value.name,
        password: value.password,
        elevationLevel: value.runElevated ? UserAccountElevationLevel.admin : UserAccountElevationLevel.nonadmin,

    };
    if (osType === OSType.Linux) {
        return new UserAccountDto({
            ...commonProperties,
            linuxUserConfiguration: value.linuxUserConfiguration,
        });
    } else {
        return new UserAccountDto({
            ...commonProperties,
            windowsUserConfiguration: value.windowsUserConfiguration,
        });
    }
}

@Component({
    selector: "bl-user-account-picker",
    templateUrl: "user-account-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserAccountPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => UserAccountPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAccountPickerComponent implements ControlValueAccessor, Validator, OnDestroy {
    public OSType = OSType;
    public LoginMode = LoginMode;

    @Input() public osType: OSType;

    public form: FormGroup;

    private _propagateChange: (value: UserAccountDto) => void = null;
    private _destroy = new Subject();

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            name: ["", Validators.required],
            password: ["", Validators.required],
            runElevated: [false],
            windowsUserConfiguration: formBuilder.group({
                loginMode: [LoginMode.Batch],
            }),
            linuxUserConfiguration: formBuilder.group({
                sshPrivateKey: [null],
                gid: [null],
                uid: [null],
            }),
        });

        this.form.valueChanges.pipe(takeUntil(this._destroy)).subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(userAccountToDto(val, this.osType));
            }
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();

    }

    public writeValue(value: UserAccountDto) {
        if (value) {
            this.form.patchValue(userAccountToFormModel(value));
        } else {
            this.reset();
        }
    }

    public reset() {
        this.form.setValue({
            name: "",
            password: "",
            runElevated: false,
            windowsUserConfiguration: {
                loginMode: LoginMode.Batch,
            },
            linuxUserConfiguration: {
                sshPrivateKey: null,
                gid: null,
                uid: null,
            },
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
                userAccounts: {
                    valid: false,
                },
            };
        }

        return null;
    }
}
