import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export enum Permission {
    None = "none",
    Read = "read",
    Write = "write",
}

/**
 * PermissionService is a generic service to handle permisison
 */
@Injectable({providedIn: "root"})
export class PermissionService {
    private _userPermissionProvider: () => Observable<Permission>;

    constructor() {
        console.log("Build dis service");
    }

    public setUserPermissionProvider(provider: () => Observable<Permission>) {
        this._userPermissionProvider = provider;
    }

    public hasPermission(permission: Permission): Observable<boolean> {
        return this._userPermissionProvider().pipe(
            map((userPermission) => {
                if (permission === Permission.Read) { return userPermission !== Permission.None; }
                return userPermission === Permission.Write;
            }),
        );
    }
}
