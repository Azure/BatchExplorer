import { Injectable } from "@angular/core";
import { List } from "immutable";
import { AsyncSubject, Observable } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { Node, NodeState } from "app/models";
import { ArrayUtils, ObservableUtils, log } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import BatchClient from "../api/batch/batch-client";
import {
    DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, TargetedDataCache,
    getOnceProxy,
} from "./core";
import { CommonListOptions, ServiceBase } from "./service-base";

export interface NodeListParams {
    poolId?: string;
}

export interface NodeParams extends NodeListParams {
    id?: string;
}

export interface PoolListOptions extends CommonListOptions {

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

    public list(initialPoolId: string, initialOptions: PoolListOptions = {}): RxListProxy<NodeListParams, Node> {
        return new RxBatchListProxy<NodeListParams, Node>(​​​Node, {
            cache: ({poolId}) => this.getCache(poolId),
            proxyConstructor: ({poolId}, options) => {
                return BatchClient.node.list(poolId, options);
            },
            initialParams: { poolId: initialPoolId },
            initialOptions,
        });
    }

    public listAll(poolId: string, options: PoolListOptions = {}): Observable<List<Node>> {
        const subject = new AsyncSubject();
        options.maxResults = 1000;
        const data = this.list(poolId, options);
        const sub = data.items.subscribe((x) => subject.next(x));
        data.fetchAll().subscribe(() => {
            subject.complete();
            sub.unsubscribe();
        });

        return subject;
    }

    public get(initialPoolId: string, initialNodeId: string, options: any): RxEntityProxy<NodeParams, Node> {
        return new RxBatchEntityProxy<NodeParams, Node>(​​​Node, {
            cache: ({poolId}) => this.getCache(poolId),
            getFn: (params: NodeParams) => {
                return BatchClient.node.get(params.poolId, params.id, options);
            },
            initialParams: { poolId: initialPoolId, id: initialNodeId },
        });
    }

    /**
     * Get a node once and forget.
     * You don't need to cleanup the subscription.
     */
    public getOnce(poolId: string, nodeId: string, options: any): Observable<Node> {
        return getOnceProxy(this.get(poolId, nodeId, options));
    }

    public reboot(poolId: string, nodeId: string): Observable<any> {
        let observable = this.callBatchClient(BatchClient.node.reboot(poolId, nodeId, {}));
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
        this.performOnEachNode(`Reboot pool '${poolId}' nodes`, poolId, states, (node) => {
            return this.reboot(poolId, node.id);
        });
    }

    /**
     * Reimage all the nodes for a given pool
     * @param poolId Id of the pool
     * @param states [Optional] list of the states the nodes should have to be rebooted
     */
    public reimageAll(poolId: string, states?: NodeState[]) {
        this.performOnEachNode(`Reboot pool '${poolId}' nodes`, poolId, states, (node) => {
            return this.reimage(poolId, node.id);
        });
    }

    public performOnEachNode(
        taskName: string,
        poolId: string,
        states: NodeState[],
        callback: (node: Node) => Observable<any>) {

        this.taskManager.startTask(taskName, (bTask) => {
            let subject = new AsyncSubject();
            const options: any = {
                maxResults: 1000,
            };
            if (states) {
                options.filter = FilterBuilder.or(...states.map(x => FilterBuilder.prop("state").eq(x))).toOData();
            }
            bTask.progress.next(1);
            this.listAll(poolId, options).subscribe((nodes) => {
                const chunks = ArrayUtils.chunk<Node>(nodes.toJS(), 100);
                const chunkFuncs = chunks.map((chunk, i) => {
                    return () => {
                        bTask.progress.next(10 + (i + 1 / chunks.length * 100));
                        return this._performOnNodeChunk(chunk, callback);
                    };
                });

                ObservableUtils.queue(...chunkFuncs).subscribe(() => subject.complete());
            });
            return subject.asObservable();
        });
    }

    public reimage(poolId: string, nodeId: string): Observable<any> {
        let observable = this.callBatchClient(
            BatchClient.node.reimage(poolId, nodeId, {}));
        observable.subscribe({
            error: (error) => {
                log.error("Error reimaging node: " + nodeId, Object.assign({}, error));
            },
        });

        return observable;
    }

    private _performOnNodeChunk(nodes: Node[], callback: any) {
        const waitFor = [];
        nodes.forEach((node, i) => {
            waitFor.push(callback(node));
        });
        return Observable.zip(...waitFor).delay(1000);
    }
}
