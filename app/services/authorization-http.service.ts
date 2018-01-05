import { Injectable } from "@angular/core";
import { RequestOptionsArgs } from "@angular/http";
import { Observable } from "rxjs";

import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";

export interface RoleDefinitionPermission {
    actions: string[];
    noActions: string[];
}

export enum BatchAccountPermission {
    Read = "*/read",
    ReadWrite = "*",
}

export type Permission = "none" | "read" | "write";

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
        return this.accountService.currentAccount.first()
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
            return "none";
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
            return "write";
        }
        if (actions.includes(BatchAccountPermission.Read)) {
            return "read";
        }
        return "none";
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
