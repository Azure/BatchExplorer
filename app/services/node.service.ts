import { Injectable } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { FilterBuilder } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { Node, NodeAgentSku, NodeConnectionSettings, NodeState } from "app/models";
import { ArrayUtils, Constants, ObservableUtils, log } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import {
    BatchEntityGetter, BatchListGetter, ContinuationToken, DataCache,
    EntityView, ListOptionsAttributes, ListView, TargetedDataCache,
} from "./core";
import { FileContentResult } from "./file-service";
import { ServiceBase } from "./service-base";

export interface NodeListParams {
    poolId?: string;
}

export interface NodeParams extends NodeListParams {
    id?: string;
}

export interface PoolListOptions extends ListOptionsAttributes {

}

@Injectable()
export class NodeService extends ServiceBase {
    private _basicProperties: string = "id,state,schedulingState,vmSize";
    private _cache = new TargetedDataCache<NodeListParams, Node>({
        key: ({ poolId }) => poolId,
    });

    private _nodeAgentSkusCache = new DataCache<any>();
    private _getter: BatchEntityGetter<Node, NodeParams>;
    private _listGetter: BatchListGetter<Node, NodeListParams>;
    private _nodeAgentSkuListGetter: BatchListGetter<NodeAgentSku, {}>;

    constructor(private taskManager: BackgroundTaskService, batchService: BatchClientService) {
        super(batchService);

        this._getter = new BatchEntityGetter(Node, this.batchService, {
            cache: ({ poolId }) => this.getCache(poolId),
            getFn: (client, params: NodeParams) => client.node.get(params.poolId, params.id),
        });

        this._listGetter = new BatchListGetter(Node, this.batchService, {
            cache: ({ poolId }) => this.getCache(poolId),
            list: (client, params, options) => {
                return client.computeNode.list(params.poolId, { computeNodeListOptions: options });
            },
            listNext: (client, nextLink: string) => client.computeNode.listNext(nextLink),
        });

        this._nodeAgentSkuListGetter = new BatchListGetter(NodeAgentSku, this.batchService, {
            cache: () => this._nodeAgentSkusCache,
            list: (client, params, options) => {
                return client.account.listNodeAgentSkus({ accountListNodeAgentSkusOptions: options });
            },
            listNext: (client, nextLink: string) => client.account.listNodeAgentSkusNext(nextLink),
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public getCache(poolId: string): DataCache<Node> {
        return this._cache.getCache({ poolId });
    }

    public list(poolId: string, options?: any, forceNew?: boolean);
    public list(nextLink: ContinuationToken);
    public list(poolIdOrNextLink: any, options = {}, forceNew = false) {
        if (poolIdOrNextLink.nextLink) {
            return this._listGetter.fetch(poolIdOrNextLink);
        } else {
            return this._listGetter.fetch({ poolId: poolIdOrNextLink }, options, forceNew);
        }
    }

    public listView(options: ListOptionsAttributes = {}): ListView<Node, NodeListParams> {
        return new ListView({
            cache: ({ poolId }) => this.getCache(poolId),
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listAll(poolId: string, options: PoolListOptions = {}): Observable<List<Node>> {
        return this._listGetter.fetchAll({ poolId }, options);
    }

    /**
     * Get a node once and forget.
     * You don't need to cleanup the subscription.
     */
    public get(poolId: string, nodeId: string, options: any = {}): Observable<Node> {
        return this._getter.fetch({ poolId, id: nodeId });
    }

    public getFromCache(poolId: string, nodeId: string, options: any = {}): Observable<Node> {
        return this._getter.fetch({ poolId, id: nodeId }, { cached: true });
    }

    /**
     * Create an entity view for a node
     */
    public view(): EntityView<Node, NodeParams> {
        return new EntityView({
            cache: ({ poolId }) => this.getCache(poolId),
            getter: this._getter,
            poll: Constants.PollRate.entity,
        });
    }

    public reboot(poolId: string, nodeId: string): Observable<any> {
        const observable = this.callBatchClient((client) => client.node.reboot(poolId, nodeId, {}));
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

    public getRemoteDesktop(poolId: string, nodeId: string, options: any = {}): Observable<FileContentResult> {
        return this.callBatchClient((client) => client.node.getRemoteDesktop(poolId, nodeId, options), (error) => {
            log.error("Error downloading RDP file for node " + nodeId, Object.assign({}, error));
        });
    }

    public getRemoteLoginSettings(poolId: string, nodeId: string, options = {}): Observable<NodeConnectionSettings> {
        return this.callBatchClient((client) => client.node.getRemoteLoginSettings(poolId, nodeId, options))
            .map((response: any) => {
                return new NodeConnectionSettings(response.data);
            });
    }

    public performOnEachNode(
        taskName: string,
        poolId: string,
        states: NodeState[],
        callback: (node: Node) => Observable<any>) {

        this.taskManager.startTask(taskName, (bTask) => {
            const options: any = {
                pageSize: 1000,
            };
            if (states) {
                options.filter = FilterBuilder.or(...states.map(x => FilterBuilder.prop("state").eq(x)));
            }
            bTask.progress.next(1);
            return this.listAll(poolId, options).cascade((nodes) => {
                const chunks = ArrayUtils.chunk<Node>(nodes.toJS(), 100);
                const chunkFuncs = chunks.map((chunk, i) => {
                    return () => {
                        bTask.progress.next(10 + (i + 1 / chunks.length * 100));
                        return this._performOnNodeChunk(chunk, callback);
                    };
                });

                return ObservableUtils.queue(...chunkFuncs);
            });
        });
    }

    public reimage(poolId: string, nodeId: string): Observable<any> {
        const observable = this.callBatchClient((client) => client.node.reimage(poolId, nodeId, {}));
        observable.subscribe({
            error: (error) => {
                log.error("Error reimaging node: " + nodeId, Object.assign({}, error));
            },
        });

        return observable;
    }

    public delete(poolId: string, nodeId: string): Observable<any> {
        return this.callBatchClient((client) => client.node.delete(poolId, nodeId, {}), (error) => {
            log.error("Error deleting node: " + nodeId, Object.assign({}, error));
        });
    }

    public uploadLogs(poolId: string, nodeId: string, params: any): Observable<any> {
        return this.callBatchClient((client) => client.node.uploadLogs(poolId, nodeId, params), (error) => {
            log.error("Error uploading logs for node: " + nodeId, {...error});
        });
    }

    public listNodeAgentSkus(options: ListOptionsAttributes = { pageSize: 1000 }): ListView<NodeAgentSku, {}> {
        return new ListView({
            cache: (params) => this._nodeAgentSkusCache,
            getter: this._nodeAgentSkuListGetter,
            initialOptions: options,
        });
    }

    private _performOnNodeChunk(nodes: Node[], callback: any) {
        const waitFor = [];
        nodes.forEach((node, i) => {
            waitFor.push(callback(node));
        });
        return Observable.zip(...waitFor).delay(1000);
    }
}
