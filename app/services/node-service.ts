import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { log } from "app/utils";
import BatchClient from "../api/batch/batch-client";
import { Node } from "../models";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, TargetedDataCache } from "./core";
import ServiceBase from "./service-base";

export interface NodeListParams {
    poolId?: string;
}

export interface NodeParams extends NodeListParams {
    id?: string;
}

@Injectable()
export class NodeService extends ServiceBase {
    private _basicProperties: string = "id,state,schedulingState,vmSize";
    private _cache = new TargetedDataCache<NodeListParams, Node>({
        key: ({poolId}) => poolId,
    });

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public getCache(poolId: string): DataCache<Node> {
        return this._cache.getCache({ poolId });
    }

    public list(initialPoolId: string, initialOptions: any = {}): RxListProxy<NodeListParams, Node> {
        return new RxBatchListProxy<NodeListParams, Node>(​​​Node, {
            cache: ({poolId}) => this.getCache(poolId),
            proxyConstructor: ({poolId}, options) => {
                return BatchClient.node.list(poolId, options);
            },
            initialParams: { poolId: initialPoolId },
            initialOptions,
        })​;
    }

    public get(initialPoolId: string, initialNodeId: string, options: any): RxEntityProxy<NodeParams, Node> {
        return new RxBatchEntityProxy<NodeParams, Node>(​​​Node, {
            cache: ({poolId}) => this.getCache(poolId),
            getFn: (params: NodeParams) => {
                return BatchClient.node.get(params.poolId, params.id, options);
            },
            initialParams: { poolId: initialPoolId },
        })​;
    }

    public reboot(poolId: string, nodeId: string): Observable<any> {
        let observable = Observable.fromPromise<any>(
            BatchClient.node.reboot(poolId, nodeId, {}));
        observable.subscribe({
            error: (error) => {
                log.error("Error rebooting node: " + nodeId, Object.assign({}, error));
            },
        });

        return observable;
    }

    public reimage(poolId: string, nodeId: string): Observable<any> {
        let observable = Observable.fromPromise<any>(
            BatchClient.node.reimage(poolId, nodeId, {}));
        observable.subscribe({
            error: (error) => {
                log.error("Error reimaging node: " + nodeId, Object.assign({}, error));
            },
        });

        return observable;
    }
}
