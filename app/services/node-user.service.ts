import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { BatchClientService } from "./batch-client.service";
import { ServiceBase } from "./service-base";

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
export class NodeUserService extends ServiceBase {
    constructor(batchService: BatchClientService) {
        super(batchService);
    }

    public addUser(poolId: string, nodeId: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.callBatchClient((client) => client.node.addUser(poolId, nodeId, user), (error) => {
            log.error("Error adding a new user to node: " + nodeId, Object.assign({}, error));
        });
    }

    public updateUser(poolId: string, nodeId: string, username: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.callBatchClient((client) => client.node.updateUser(poolId, nodeId, username, user), (error) => {
            log.error("Error updating user to node: " + nodeId, Object.assign({}, error));
        });
    }

    /**
     * Helper that will try to add a new user and if already exist update it.
     */
    public addOrUpdateUser(poolId: string, nodeId: string, user: AddNodeUserAttributes) {
        return this.addUser(poolId, nodeId, user).catch((e: ServerError) => {
            if (e.code === "NodeUserExists") {
                return this.updateUser(poolId, nodeId, user.name, user);
            } else {
                throw e;
            }
        });
    }

    public deleteUser(poolId: string, nodeId: string, username: string): Observable<{}> {
        return this.callBatchClient((client) => client.node.deleteUser(poolId, nodeId, username), (error) => {
            log.error("Error removing user to node: " + nodeId, Object.assign({}, error));
        });
    }
}
