import { Injectable } from "@angular/core";
import { RequestOptionsArgs } from "@angular/http";
import { Observable } from "rxjs";

import { Permission, PermissionService } from "@batch-flask/ui/permission";
import { AccountService } from "../account.service";
import { ArmHttpService } from "../arm-http.service";

export interface RoleDefinitionPermission {
    actions: string[];
    noActions: string[];
}

export enum BatchAccountPermission {
    Read = "*/read",
    ReadWrite = "*",
}

/**
 * Wrapper around the http service so call the azure ARM authorization api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class AuthorizationHttpService {
    private _permission: Observable<Permission>;
    constructor(
        private accountService: AccountService,
        private armService: ArmHttpService,
        permissionService: PermissionService) {
        this._permission = this.accountService.currentAccount.take(1)
            .flatMap(account => {
                const resourceId = account && account.id;
                if (resourceId) {
                    const url = this._getPermissionUrl(resourceId);
                    return this._recursiveRequest(url).flatMap(permissions => {
                        const permission = this.checkResoucePermissions(permissions);
                        return Observable.of(permission);
                    });
                }
            }).shareReplay(1);
    }

    /**
     * Check current account resouce permission
     */
    public getResourcePermission(): Observable<Permission> {
        return this._permission;
    }

    /**
     * Check if you have the @param permission with the current account
     */
    public hasPermission(permission: Permission): Observable<boolean> {
        return this.getResourcePermission().map((userPermission) => {
            if (permission === Permission.Read) { return userPermission !== Permission.None; }
            return userPermission === Permission.Write;
        });
    }

    public checkResoucePermissions(permissions: RoleDefinitionPermission[]): Permission {
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return Permission.None;
        }
        let actions = [];
        for (const permission of permissions) {
            if (permission.actions) {
                actions = actions.concat(permission.actions);
            }
        }
        // If user only has 'Reader' role without any 'Write' roles, action should be disabled
        // Note that user could be assigned to multiple roles at same time (Reader, Owner, Contributor),
        // in this case, permission should be checked from highest to lowest
        if (actions.includes(BatchAccountPermission.ReadWrite)) {
            return Permission.Write;
        }
        if (actions.includes(BatchAccountPermission.Read)) {
            return Permission.Read;
        }
        return Permission.None;
    }

    private _recursiveRequest(uri: string, options?: RequestOptionsArgs): Observable<any> {
        return this.armService.get(uri, options).expand(obs => {
            return obs.json().nextLink ? this.armService.get(obs.json().nextLink, options) : Observable.empty();
        }).reduce((permission, response) => {
            return [...permission, ...response.json().value];
        }, []);
    }

    private _getPermissionUrl(resourceId: string) {
        return `${resourceId}/providers/Microsoft.Authorization/permissions`;
    }
}
