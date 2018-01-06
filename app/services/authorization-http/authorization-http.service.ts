import { Injectable } from "@angular/core";
import { RequestOptionsArgs } from "@angular/http";
import { Observable } from "rxjs";

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

export enum Permission {
    None = "none",
    Read = "read",
    Write = "write",
}

/**
 * Wrapper around the http service so call the azure ARM authorization api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class AuthorizationHttpService {
    constructor(private accountService: AccountService, private armService: ArmHttpService) {
    }

    /**
     * Check current account resouce permission
     */
    public getResourcePermission(): Observable<Permission> {
        return this.accountService.currentAccount.take(1)
            .flatMap(account => {
                const resourceId = account && account.id;
                if (resourceId) {
                    const url = this._getPermissionUrl(resourceId);
                    return this._recursiveRequest(url).flatMap(permissions => {
                        const permission = this._checkResoucePermissions(permissions);
                        return Observable.of(permission);
                    });
                }
            }).share();
    }

    private _checkResoucePermissions(permissions: RoleDefinitionPermission[]): Permission {
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return Permission.None;
        }
        let actions = [];
        for (let permission of permissions) {
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
