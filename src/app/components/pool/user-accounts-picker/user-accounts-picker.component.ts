import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { I18nService, autobind } from "@batch-flask/core";
import { CertificateReferenceAttributes, OSType, UserAccountElevationLevel } from "app/models";
import { UserAccountDto } from "app/models/dtos";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "bl-user-accounts-picker",
    templateUrl: "user-accounts-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UserAccountsPickerComponent),
            multi: true,
        },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => UserAccountsPickerComponent), multi: true },
    ],
})
export class UserAccountsPickerComponent implements ControlValueAccessor, Validator, OnDestroy {
    public UserAccountElevationLevel = UserAccountElevationLevel;
    @Input() public osType: OSType;

    public userAccounts = new FormControl([], this._duplicateValidator);

    private _propagateChange?: (value: UserAccountDto[]) => void;
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef, private i18n: I18nService) {
        this.userAccounts.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
    public validate(c: FormControl): ValidationErrors | null {
        if (this.userAccounts.valid) {
            return null;
        } else {
            return {
                invalid: true,
            };
        }
    }

    public writeValue(obj: CertificateReferenceAttributes[] | null): void {
        if (obj) {
            this.userAccounts.setValue(obj);
        } else {
            this.userAccounts.setValue([]);
        }
        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn: (value: UserAccountDto[]) => void): void {
        this._propagateChange = fn;

    }

    public registerOnTouched(fn: any): void {
        // Nothing
    }

    @autobind()
    private _duplicateValidator(control: FormControl): ValidationErrors | null {
        const users = control.value;
        if (users === null) {
            return null;
        }
        let duplicate: string | null = null;
        const usernames = new Set<string>();

        for (const user of users) {
            if (usernames.has(user.name)) {
                duplicate = user.name;
                return {
                    duplicate: {
                        value: duplicate,
                        message: this.i18n.t("user-accounts-picker.duplicate", { username: duplicate }),
                    },
                };
            }
            usernames.add(user.name);
        }

        return null;
    }
}
