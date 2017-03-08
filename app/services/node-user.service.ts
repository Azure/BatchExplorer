import { Injectable } from "@angular/core";
import BatchClient from "app/api/batch/batch-client";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { log } from "app/utils";
import { ServiceBase } from "./service-base";

export interface UpdateNodeUserAttributes {
    expiryTime?: Date;
    password?: string;
    sshPublicKey?: string;
}

export interface AddNodeUserAttributes extends UpdateNodeUserAttributes {
    name?: string;
    isAdmin?: boolean;
}

@Injectable()
export class NodeUserService extends ServiceBase {
    public addUser(poolId: string, nodeId: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.callBatchClient(BatchClient.node.addUser(poolId, nodeId, user), (error) => {
            log.error("Error adding a new user to node: " + nodeId, Object.assign({}, error));
        });
    }

    public updateUser(poolId: string, nodeId: string, username: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.callBatchClient(BatchClient.node.updateUser(poolId, nodeId, username, user), (error) => {
            log.error("Error updating user to node: " + nodeId, Object.assign({}, error));
        });
    }

    /**
     * Helper that will try to add a new user and if already exist update it.
     */
    public addOrUpdateUser(poolId: string, nodeId: string, user: AddNodeUserAttributes) {
        return this.addUser(poolId, nodeId, user).catch((e: ServerError) => {
            if (e.status && e.body.code === "NodeUserExists") {
                return this.updateUser(poolId, nodeId, user.name, user);
            } else {
                throw e;
            }
        });
    }

    public deleteUser(poolId: string, nodeId: string, username: string): Observable<{}> {
        return this.callBatchClient(BatchClient.node.deleteUser(poolId, nodeId, username), (error) => {
            log.error("Error removing user to node: " + nodeId, Object.assign({}, error));
        });
    }
}
