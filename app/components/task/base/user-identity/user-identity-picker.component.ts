import { Component, Input, OnChanges, OnDestroy, forwardRef } from "@angular/core";
import { FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { AutoUserScope, UserAccount, UserAccountElevationLevel } from "app/models";
import { UserIdentityDto } from "app/models/dtos";

interface UserOption {
    label: string
    identity: UserIdentityDto;
}

const defaultUsers = [
    {
        label: "Task user",
        scope: AutoUserScope.task,
        elevationLevel: UserAccountElevationLevel.nonAdmin,
    },
    {
        label: "Task user (Admin)",
        scope: AutoUserScope.task,
        elevationLevel: UserAccountElevationLevel.admin,
    },
    {
        label: "Pool user",
        scope: AutoUserScope.pool,
        elevationLevel: UserAccountElevationLevel.nonAdmin,
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
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserIdentityComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => UserIdentityComponent), multi: true },
    ],
})
export class UserIdentityComponent implements OnChanges, OnDestroy {
    @Input()
    public userAccounts: List<UserAccount> | UserAccount[];

    public options: UserOption[];
    public selected = new FormControl();
    private _propagateChange: Function = null;
    private _sub: Subscription;

    constructor() {
        this._updateOptions();
        this.reset();
        this._sub = this.selected.valueChanges.subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }


    public writeValue(value: any) {
        if (value) {
            this.selected.patchValue(value);
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
                identity: { userName: x.name },
            };
        });
        this.options = options.concat(defaultUsers);
    }
}
