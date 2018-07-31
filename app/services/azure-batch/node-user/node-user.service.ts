import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { catchError } from "rxjs/operators";
import { AzureBatchHttpService } from "../core";

export interface UpdateNodeUserAttributes {
    expiryTime?: Date;
    password?: string;
    sshPublicKey?: string;
}

export interface AddNodeUserAttributes extends UpdateNodeUserAttributes {
    name?: string;
    isAdmin?: boolean;
    expiryTime?: Date;
}

@Injectable()
export class NodeUserService {
    constructor(private http: AzureBatchHttpService) {
    }

    public addUser(poolId: string, nodeId: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/users`, user);
    }

    public updateUser(poolId: string, nodeId: string, username: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.http.put(`/pools/${poolId}/nodes/${nodeId}/users/${username}`, user);
    }

    /**
     * Helper that will try to add a new user and if already exist update it.
     */
    public addOrUpdateUser(poolId: string, nodeId: string, user: AddNodeUserAttributes) {
        return this.addUser(poolId, nodeId, user).pipe(
            catchError((e: ServerError) => {
                if (e.code === "NodeUserExists") {
                    delete user.isAdmin; // Cannot update user admin rights
                    return this.updateUser(poolId, nodeId, user.name, user);
                } else {
                    return throwError(e);
                }
            }),
        );
    }

    public deleteUser(poolId: string, nodeId: string, username: string): Observable<{}> {
        return this.http.delete(`/pools/${poolId}/nodes/${nodeId}/users/${username}`);
    }
}
