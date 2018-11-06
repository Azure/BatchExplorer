import { Injectable } from "@angular/core";
import { HttpRequestOptions } from "@batch-flask/core";
import { Permission } from "@batch-flask/ui/permission";
import { Observable, empty, of } from "rxjs";
import { expand, flatMap, map, reduce, shareReplay, take } from "rxjs/operators";
import { ArmBatchAccount } from "../../models";
import { ArmHttpService } from "../arm-http.service";
import { BatchAccountService } from "../batch-account";
import { ArmListResponse } from "../core";

export interface RoleDefinitionPermission {
    actions: string[];
    notActions: string[];
}

export enum BatchAccountPermission {
    Read = "*/read",
    ReadWrite = "*",
    Write = "Microsoft.Authorization/*/Write",
}

/**
 * Wrapper around the http service so call the azure ARM authorization api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class AuthorizationHttpService {
    private _permission: Observable<Permission>;
    constructor(
        private accountService: BatchAccountService,
        private armService: ArmHttpService) {

        this._permission = this.accountService.currentAccount.pipe(
            take(1),
            flatMap(account => {
                if (account instanceof ArmBatchAccount) {
                    const resourceId = account && account.id;
                    return this.getPermission(resourceId);
                } else {
                    return of(Permission.Write);
                }
            }),
            shareReplay(1),
        );
    }

    /**
     * Helper funtion that checks resource or resource group permission
     * @param resourceId resource id or resource group id
     */
    public getPermission(resourceId: string): Observable<Permission> {
        if (!resourceId) {
            return of(Permission.None);
        }
        const url = this._getPermissionUrl(resourceId);
        return this._recursiveRequest(url).pipe(
            flatMap(permissions => {
                const permission = this.checkResoucePermissions(permissions);
                return of(permission);
            }),
        );
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
        return this.getResourcePermission().pipe(
            map((userPermission) => {
                if (permission === Permission.Read) { return userPermission !== Permission.None; }
                return userPermission === Permission.Write;
            }),
        );
    }

    public checkResoucePermissions(permissions: RoleDefinitionPermission[]): Permission {
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return Permission.None;
        }
        let actions = [];
        let notactions = [];
        for (const permission of permissions) {
            if (permission.actions) {
                actions = actions.concat(permission.actions);
            }
            if (permission.notActions) {
                notactions = notactions.concat(permission.notActions);
            }
        }
        // If user only has 'Reader' role without any 'Write' roles, action should be disabled
        // Note that user could be assigned to multiple roles at same time (Reader, Owner, Contributor),
        // in this case, permission should be checked from highest to lower
        if (actions.includes(BatchAccountPermission.ReadWrite)) {
            return Permission.Write;
        }
        if (actions.includes(BatchAccountPermission.Read)) {
            return Permission.Read;
        }
        return Permission.None;
    }

    private _recursiveRequest<T = any>(uri: string, options?: HttpRequestOptions): Observable<T[]> {
        return this.armService.get<ArmListResponse<T>>(uri, options).pipe(
            expand(response => {
                return response.nextLink ? this.armService.get(response.nextLink, options) : empty();
            }),
            reduce((permission, response: ArmListResponse<T>) => {
                return [...permission, ...response.value];
            }, []),
        );
    }

    private _getPermissionUrl(resourceId: string) {
        return `${resourceId}/providers/Microsoft.Authorization/permissions`;
    }
}
