import { Injectable } from "@angular/core";
import { AsyncSubject, Observable } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { log } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import BatchClient from "../api/batch/batch-client";
import { Node, NodeState } from "../models";
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

    constructor(private taskManager: BackgroundTaskManager) {
        super();
    }
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

    /**
     * Reboot all the nodes for a given pool
     * @param poolId Id of the pool
     * @param states [Optional] list of the states the nodes should have to be rebooted
     */
    public rebootAll(poolId: string, states?: NodeState[]) {

        this.taskManager.startTask(`Reboot pool '${poolId}' nodes`, (bTask) => {
            let subject = new AsyncSubject();
            const options: any = {
                maxResults: 1000,
            };
            if (states) {
                options.filter = FilterBuilder.or(...states.map(x => FilterBuilder.prop("state").eq(x))).toOData();
            }
            const data = this.list(poolId, options);
            bTask.progress.next(1);
            data.fetchNext(true).subscribe(() => {
                const sub = data.items.subscribe(nodes => {
                    const waitFor = [];
                    bTask.progress.next(10);
                    nodes.forEach((node, i) => {

                        waitFor.push(this.reboot(poolId, node.id));
                        bTask.progress.next(10 + (i + 1 / node.size * 90));
                    });
                    Observable.zip(...waitFor).subscribe(() => subject.complete());
                });
                sub.unsubscribe();
            });
            return subject.asObservable();
        });
    }

    public performOnEachNode(poolId: string, callback: (node: Node) => void) {

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
