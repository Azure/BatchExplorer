import { Injectable } from "@angular/core";

import { RoleAssignment } from "app/models";
import { ArmListGetter, TargetedDataCache } from "app/services/core";
import { List } from "immutable";
import { Observable } from "rxjs/Observable";
import { AccountService } from "../account.service";
import { ArmHttpService } from "../arm-http.service";

interface RolesListParams {
    resourceId: string;
}

@Injectable()
export class ResourceAccessService {
    private _rolesListGetter: ArmListGetter<RoleAssignment, RolesListParams>;
    private _rolesCache = new TargetedDataCache<RolesListParams, RoleAssignment>({
        key: ({ resourceId }) => resourceId,
    });

    constructor(private accountService: AccountService, private arm: ArmHttpService) {
        this._rolesListGetter = new ArmListGetter<RoleAssignment, RolesListParams>(RoleAssignment, this.arm, {
            cache: (params) => this._rolesCache.getCache(params),
            uri: ({resourceId}) => `${resourceId}/providers/Microsoft.Authorization/roleAssignments`,
        });
    }

    /**
     * List roles for the currently selected batch account
     */
    public listRolesForCurrentAccount(): Observable<List<RoleAssignment>> {
        return this.accountService.currentAccount.take(1).flatMap((account) => {
            return this.listRolesFor(account.id);
        }).shareReplay(1);
    }

    public listRolesFor(resourceId: string): Observable<List<RoleAssignment>> {
        return this._rolesListGetter.fetchAll({resourceId});
    }
}
