import { Component, Input, OnChanges } from "@angular/core";
import { FormControl } from "@angular/forms";
import { List } from "immutable";

import { AutoUserScope, UserAccount, UserAccountElevationLevel } from "app/models";
import { UserIdentityDto } from "app/models/dtos";

interface UserOption {
    label: string
    identity: UserIdentityDto;
}

@Component({
    selector: "bl-user-identity-picker",
    templateUrl: "user-identity-picker.html",
})
export class UserIdentityComponent implements OnChanges {
    @Input()
    public userAccounts: List<UserAccount> | UserAccount[];

    public options: UserOption[];
    public selected = new FormControl(null);

    constructor() {
        this._updateOptions();
    }

    public ngOnChanges(inputs) {
        if (inputs.userAccounts) {
            this._updateOptions();
        }
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
        this.options = options.concat(this._defaultUsers());
    }

    private _defaultUsers(): UserOption[] {
        return [
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
    }
}
