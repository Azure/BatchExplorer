import { Injectable } from "@angular/core";

import { RoleAssignment, RoleDefinition } from "app/models";
import { ArmListGetter, TargetedDataCache } from "app/services/core";
import { SecureUtils } from "common";
import { List } from "immutable";
import { Observable } from "rxjs/Observable";
import { AccountService } from "../account.service";
import { ArmHttpService } from "../arm-http.service";

interface RoleAssignmentListParams {
    resourceId: string;
}

interface RoleListParams {
    scope: string;
}

@Injectable()
export class ResourceAccessService {
    private _rolesAssignmentListGetter: ArmListGetter<RoleAssignment, RoleAssignmentListParams>;
    private _rolesListGetter: ArmListGetter<RoleDefinition, RoleListParams>;
    private _roleAssignmentsCache = new TargetedDataCache<RoleAssignmentListParams, RoleAssignment>({
        key: ({ resourceId }) => resourceId,
    });
    private _rolesCache = new TargetedDataCache<RoleListParams, RoleDefinition>({
        key: ({ scope }) => scope,
    });

    constructor(private accountService: AccountService, private arm: ArmHttpService) {
        this._rolesAssignmentListGetter = new ArmListGetter<RoleAssignment, RoleAssignmentListParams>(RoleAssignment,
            this.arm, {
                cache: (params) => this._roleAssignmentsCache.getCache(params),
                uri: ({ resourceId }) => `${resourceId}/providers/Microsoft.Authorization/roleAssignments`,
            });
        this._rolesListGetter = new ArmListGetter<RoleDefinition, RoleListParams>(RoleDefinition, this.arm, {
            cache: (params) => this._rolesCache.getCache(params),
            uri: ({ scope }) => `${scope}/providers/Microsoft.Authorization/roleDefinitions`,
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
        return this._rolesAssignmentListGetter.fetchAll({ resourceId });
    }

    public listRoleDefinitions(scope: string): Observable<List<RoleDefinition>> {
        return this._rolesListGetter.fetchAll({ scope });
    }

    public getRoleByName(scope: string, name: string): Observable<RoleDefinition> {
        return this._rolesListGetter.fetch({ scope }, { filter: `roleName eq '${name}'` }, true).map(x => {
            return x.items.first();
        });
    }

    public createAssignment(resourceId: string, principalId: string, roleDefinitionId: string): Observable<any> {
        const id = SecureUtils.uuid();
        return this.arm.put(`${resourceId}/providers/Microsoft.Authorization/roleAssignments/${id}`, {
            body: {
                properties: {
                    roleDefinitionId,
                    principalId,
                },
            },
        });
    }

    public deleteAssignment(id: string): Observable<any> {
        return this.arm.delete(id);
    }
}
