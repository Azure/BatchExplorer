import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    FilterBuilder,
    HttpCode,
    ListOptionsAttributes,
    ListResponse,
    ListView,
    ServerError,
    TargetedDataCache,
} from "@batch-flask/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity";
import { Node, NodeState } from "app/models";
import { Constants } from "common";
import { List } from "immutable";
import { Observable, of, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
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

@Injectable({ providedIn: "root" })
export class NodeService {
    private _basicProperties: string = "id,state,schedulingState,vmSize";
    private _cache = new TargetedDataCache<NodeListParams, Node>({
        key: ({ poolId }) => poolId,
    });

    private _getter: BatchEntityGetter<Node, NodeParams>;
    private _listGetter: BatchListGetter<Node, NodeListParams>;

    constructor(private activityService: ActivityService, private http: AzureBatchHttpService) {
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

    public exist(params: NodeParams): Observable<boolean> {
        const httpParams = new HttpParams().set("$select", "id");
        return this.http.get(`/pools/${params.poolId}/nodes/${params.id}`, { params: httpParams }).pipe(
            map(_ => true),
            catchError((error: ServerError) => {
                if (error.status === HttpCode.NotFound) {
                    return of(false);
                } else {
                    return throwError(error);
                }
            }),
        );
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
        this.performOnEachNode(`Rebooting nodes in pool '${poolId}'`, poolId, states, (node) => {
            return this.reboot(poolId, node.id);
        });
    }

    /**
     * Reimage all the nodes for a given pool
     * @param poolId Id of the pool
     * @param states [Optional] list of the states the nodes should have to be rebooted
     */
    public reimageAll(poolId: string, states?: NodeState[]) {
        this.performOnEachNode(`Reimaging nodes in pool '${poolId}'`, poolId, states, (node) => {
            return this.reimage(poolId, node.id);
        });
    }

    public performOnEachNode(
        taskName: string,
        poolId: string,
        states: NodeState[],
        callback: (node: Node) => Observable<any>) {

        const options: any = {
            pageSize: 1000,
        };
        if (states) {
            options.filter = FilterBuilder.or(...states.map(x => FilterBuilder.prop("state").eq(x)));
        }

        const initializer = () => {
            // list all nodes in this pool
            return this.listAll(poolId, options).pipe(
                // map the list of nodes to a list of activities to run on the nodes
                map(nodes => {
                    return nodes.toArray().map(node => {
                        const name = `Running on node '${node.id}'`;
                        return new Activity(name, () => callback(node));
                    });
                }),
            );
        };

        const activity = new Activity(taskName, initializer);
        this.activityService.exec(activity);

        return activity.done;
    }

    public reimage(poolId: string, nodeId: string): Observable<any> {
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/reimage`, null);

    }

    public disableScheduling(poolId: string, nodeId: string): Observable<any> {
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/disablescheduling`, null);
    }

    public enableScheduling(poolId: string, nodeId: string): Observable<any> {
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/enablescheduling`, null);
    }

    public delete(poolId: string, nodeId: string | string[]): Observable<any> {
        return this.http.post(`/pools/${poolId}/removenodes`, {
            nodeList: Array.isArray(nodeId) ? nodeId : [nodeId],
        });
    }

    public uploadLogs(poolId: string, nodeId: string, params: any): Observable<any> {
        return this.http.post(`/pools/${poolId}/nodes/${nodeId}/uploadbatchservicelogs`, params);
    }
}
