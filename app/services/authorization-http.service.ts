import { Injectable } from "@angular/core";
import {
    RequestMethod, RequestOptions, RequestOptionsArgs, Response,
} from "@angular/http";
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

function mergeOptions(original: RequestOptionsArgs, method: RequestMethod, body?: any): RequestOptionsArgs {
    const options = original || new RequestOptions();
    options.method = method;
    if (body) {
        options.body = body;
    }

    return options;
}

/**
 * Wrapper around the http service so call the azure ARM authorization api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class AuthorizationHttpService {
    constructor(private accountService: AccountService,
                private armService: ArmHttpService) {
    }

    public requestPermissions() {
        return this.accountService.currentAccount.first()
            .flatMap(account => {
                const resourceId = account && account.id;
                if (resourceId) {
                    const url = this._getPermissionUrl(resourceId);
                    return this.recursiveRequest(url);
                }
            }).share();
    }

    public isResourceReadOnly(permissions: RoleDefinitionPermission[]) {
        if (!permissions) {
            return false;
        }
        let actions = [];
        for (let permission of permissions) {
            if (permission.actions) {
                actions = actions.concat(permission.actions);
            }
        }
        // If user only has 'Reader' role without any 'Write' roles, button should be disabled
        // Note that user could be assigned to multiple roles at same time (Reader, Owner, Contributor),
        // in this case, permission should be checked from highest to lowest
        return !actions.includes(BatchAccountPermission.ReadWrite) && actions.includes(BatchAccountPermission.Read);
    }

    public recursiveRequest(uri: string, options?: RequestOptionsArgs): Observable<Response> {
        options = mergeOptions(options, RequestMethod.Get);
        return this.armService.request(uri, options).expand(obs => {
            return obs.json().nextLink ? this.armService.request(obs.json().nextLink, options) : Observable.empty();
        });
    }

    private _getPermissionUrl(resourceId: string) {
        return `${resourceId}/providers/Microsoft.Authorization/permissions`;
    }
}
