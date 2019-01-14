import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import { FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { AutoUserScope, UserAccount, UserAccountElevationLevel, UserIdentityAttributes } from "app/models";
import { UserIdentityDto } from "app/models/dtos";

interface UserOption {
    label: string;
    identity: UserIdentityDto;
}

const defaultUsers = [
    {
        label: "Task user",
        scope: AutoUserScope.task,
        elevationLevel: UserAccountElevationLevel.nonadmin,
    },
    {
        label: "Task user (Admin)",
        scope: AutoUserScope.task,
        elevationLevel: UserAccountElevationLevel.admin,
    },
    {
        label: "Pool user",
        scope: AutoUserScope.pool,
        elevationLevel: UserAccountElevationLevel.nonadmin,
    },
    {
        label: "Pool user (Admin)",
        scope: AutoUserScope.pool,
        elevationLevel: UserAccountElevationLevel.admin,
    },
].map(({ label, scope, elevationLevel }) => {
    return {
        label,
        identity: {
            autoUser: {
                scope,
                elevationLevel,
            },
        },
    };
});

const defaultSelectedUser = defaultUsers[0];

@Component({
    selector: "bl-user-identity-picker",
    templateUrl: "user-identity-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserIdentityPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => UserIdentityPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserIdentityPickerComponent implements OnChanges, OnDestroy {
    @Input() public userAccounts: List<UserAccount> | UserAccount[];

    public options: UserOption[];
    public selected = new FormControl<UserIdentityAttributes>();
    private _propagateChange: (value: UserIdentityAttributes) => void = null;
    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {
        this._updateOptions();
        this.reset();
        this._sub = this.selected.valueChanges.subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public writeValue(value: UserIdentityAttributes | null) {
        if (value) {
            const options = this.options;
            let picked;

            if (value.username) {
                picked = options.filter(x => x.identity.username === value.username).first();
            } else if (value.autoUser) {
                picked = options.filter(x => {
                    return x.identity.autoUser
                        && x.identity.autoUser.scope === value.autoUser.scope
                        && x.identity.autoUser.elevationLevel === value.autoUser.elevationLevel;
                }).first();
            }
            if (!picked) {
                picked = defaultSelectedUser;
            }
            this.selected.setValue(picked.identity);
        } else {
            this.reset();
        }
    }

    public reset() {
        this.selected.reset(defaultSelectedUser.identity);
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

    public ngOnChanges(inputs) {
        if (inputs.userAccounts) {
            this._updateOptions();
        }
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public trackOption(index, option: UserOption) {
        return index;
    }

    private _getAccounts(): UserAccount[] {
        if (!this.userAccounts) {
            return [];
        }
        if (Array.isArray(this.userAccounts)) {
            return this.userAccounts;
        } else {
            return this.userAccounts.toArray();
        }
    }

    private _updateOptions() {
        const accounts = this._getAccounts();

        const options: UserOption[] = accounts.map((x) => {
            let label = x.name;

            if (x.elevationLevel === UserAccountElevationLevel.admin) {
                label = `${label} (Admin)`;
            }
            return {
                label,
                identity: { username: x.name },
            };
        });
        this.options = options.concat(defaultUsers);
        this.changeDetector.markForCheck();
    }
}
