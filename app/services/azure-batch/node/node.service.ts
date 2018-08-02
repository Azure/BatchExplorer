import { Injectable } from "@angular/core";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    FilterBuilder,
    ListOptionsAttributes,
    ListResponse,
    ListView,
    TargetedDataCache,
} from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { Node, NodeState } from "app/models";
import { ArrayUtils, Constants, ObservableUtils } from "app/utils";
import { List } from "immutable";
import { Observable, zip } from "rxjs";
import { delay, flatMap } from "rxjs/operators";
import {
    AzureBatchHttpService, BatchEntityGetter, BatchListGetter,
} from "../core";

export interface NodeListParams {
    poolId?: string;
}

export interface NodeParams extends NodeListParams {
    id?: string;
}

export interface PoolListOptions extends ListOptionsAttributes {

}

@Injectable()
export class NodeService {
    private _basicProperties: string = "id,state,schedulingState,vmSize";
    private _cache = new TargetedDataCache<NodeListParams, Node>({
        key: ({ poolId }) => poolId,
    });

    private _getter: BatchEntityGetter<Node, NodeParams>;
    private _listGetter: BatchListGetter<Node, NodeListParams>;

    constructor(private taskManager: BackgroundTaskService, private http: AzureBatchHttpService) {
        this._getter = new BatchEntityGetter(Node, this.http, {
            cache: ({ poolId }) => this.getCache(poolId),
            uri: (params: NodeParams) => `/pools/${params.poolId}/nodes/${params.id}`,
        });

        this._listGetter = new BatchListGetter(Node, this.http, {
            cache: ({ poolId }) => this.getCache(poolId),
            uri: (params: NodeListParams) => `/pools/${params.poolId}/nodes`,
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public getCache(poolId: string): DataCache<Node> {
        return this._cache.getCache({ poolId });
    }

    public list(poolId: string, options?: any, forceNew?: boolean): Observable<ListResponse<Node>>;
    public list(nextLink: ContinuationToken): Observable<ListResponse<Node>>;
    public list(poolIdOrNextLink: any, options = {}, forceNew = false): Observable<ListResponse<Node>> {
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
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/reboot`, null);
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
            const options: any = {
                pageSize: 1000,
            };
            if (states) {
                options.filter = FilterBuilder.or(...states.map(x => FilterBuilder.prop("state").eq(x)));
            }
            bTask.progress.next(1);
            return this.listAll(poolId, options).pipe(
                flatMap((nodes) => {
                    const chunks = ArrayUtils.chunk<Node>(nodes.toJS(), 100);
                    const chunkFuncs = chunks.map((chunk, i) => {
                        return () => {
                            bTask.progress.next(10 + (i + 1 / chunks.length * 100));
                            return this._performOnNodeChunk(chunk, callback);
                        };
                    });

                    return ObservableUtils.queue(...chunkFuncs);
                }),
            );
        });
    }

    public reimage(poolId: string, nodeId: string): Observable<any> {
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/reimage`, null);

    }

    public delete(poolId: string, nodeId: string): Observable<any> {
        return this.http.post(`/pools/${poolId}/removenodes`, {
            nodeList: [nodeId],
        });
    }

    public uploadLogs(poolId: string, nodeId: string, params: any): Observable<any> {
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/uploadbatchservicelogs`, params);
    }

    private _performOnNodeChunk(nodes: Node[], callback: any) {
        const waitFor = [];
        nodes.forEach((node, i) => {
            waitFor.push(callback(node));
        });
        return zip(...waitFor).pipe(delay(1000));
    }
}
