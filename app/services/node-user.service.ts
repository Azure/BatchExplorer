import { Injectable } from "@angular/core";
import BatchClient from "app/api/batch/batch-client";
import { Observable } from "rxjs";

import { log } from "app/utils";
import { ServiceBase } from "./service-base";
import { FileContentResult } from "./file.service";

interface UpdateNodeUserAttributes {
    expiryTime?: Date;
    password?: string;
    sshPublicKey?: string;
}

interface AddNodeUserAttributes extends UpdateNodeUserAttributes {
    name?: string;
    isAdmin?: boolean;
}

@Injectable()
export class NodeUserService extends ServiceBase {
    public addUser(poolId: string, nodeId: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.callBatchClient(BatchClient.node.addUser(poolId, nodeId, user)).do({
            error: (error) => {
                log.error("Error adding a new user to node" + nodeId, Object.assign({}, error));
            },
        });
    }

    public updateUser(poolId: string, nodeId: string, username: string, user: AddNodeUserAttributes): Observable<{}> {
        return this.callBatchClient(BatchClient.node.updateUser(poolId, nodeId, username, user)).do({
            error: (error) => {
                log.error("Error adding a new user to node" + nodeId, Object.assign({}, error));
            },
        });
    }

    /**
     * Helper that will try to add a new user and if already exist update it.
     */
    public addOrUpdateUser(poolId: string, nodeId: string, user: AddNodeUserAttributes) {
        return this.addUser(poolId, nodeId, user).catch((e) => {
            return this.updateUser(poolId, nodeId, user.name, user);
        });
    }

    public deleteUser(poolId: string, nodeId: string, username: string): Observable<{}> {
        return this.callBatchClient(BatchClient.node.deleteUser(poolId, nodeId, username)).do({
            error: (error) => {
                log.error("Error adding a new user to node" + nodeId, Object.assign({}, error));
            },
        });
    }

    public getRemoteDesktop(poolId: string, nodeId: string, options: any = {}): Observable<FileContentResult> {
        return this.callBatchClient(BatchClient.node.getRemoteDesktop(poolId, nodeId, options), (error) => {
            log.error("Error downloading RDP file for node " + nodeId, Object.assign({}, error));
        });
    }
}
