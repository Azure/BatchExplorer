import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Node, NodeState, Pool } from "app/models";
import { NodeListParams, NodeService } from "app/services";
import { PollObservable, RxListProxy } from "app/services/core";
import { NodesStateHistoryData, RunningTasksHistoryData } from "./history-data";
import { StateCounter } from "./state-counter";

enum AvailableGraph {
    Heatmap,
    AvailableNodes,
    RunningTasks,
}

const HistoryLength = {
    OneMinute: 1,
    TenMinute: 10,
    OneHour: 60,
};

const refreshRate = 5000;
@Component({
    selector: "bl-pool-graphs",
    templateUrl: "pool-graphs.html",
})
export class PoolGraphsComponent implements OnChanges, OnDestroy {
    public AvailableGraph = AvailableGraph;
    public HistoryLength = HistoryLength;

    @Input()
    public pool: Pool;

    public data: RxListProxy<NodeListParams, Node>;

    public nodes: List<Node> = List([]);
    public startTaskFailedError: any;

    public runningTaskHistory = new RunningTasksHistoryData();
    public runningNodesHistory = new NodesStateHistoryData([NodeState.running, NodeState.idle]);

    public focusedGraph = AvailableGraph.Heatmap;
    public selectedHistoryLength = new FormControl(HistoryLength.TenMinute);

    private _stateCounter = new StateCounter();

    private _poll: PollObservable;
    private _nodesSub: Subscription;

    constructor(private nodeService: NodeService, private router: Router) {
        this.data = nodeService.list(null, {
            maxResults: 1000,
            select: "recentTasks,id,state",
        });
        this._nodesSub = this.data.items.subscribe((nodes) => {
            if (nodes.size !== 0) {
                this.nodes = nodes;
                this._stateCounter.updateCount(nodes);
                this.runningNodesHistory.update(this.nodes);
                this.runningTaskHistory.update(this.nodes);
            }
            this._scanForProblems();
        });

        this.selectedHistoryLength.valueChanges.subscribe((value) => {
            this.runningNodesHistory.setHistorySize(value);
            this.runningTaskHistory.setHistorySize(value);
        });
        this._poll = this.data.startPoll(refreshRate);
    }

    public ngOnChanges(changes) {
        if (changes.pool) {
            this.data.updateParams({ poolId: this.pool.id });
            this.data.refresh(false);
        }
    }

    public ngOnDestroy() {
        this._poll.destroy();
        this._nodesSub.unsubscribe();
    }

    @autobind()
    public openEditStartTask() {
        this.router.navigate([], {
            queryParams: { tab: "startTask" },
        });
    }

    @autobind()
    public rebootFailedNodes() {
        this.nodeService.rebootAll(this.pool.id, [NodeState.startTaskFailed]);
    }

    @autobind()
    public reimageFailedNodes() {
        this.nodeService.reimageAll(this.pool.id, [NodeState.startTaskFailed]);
    }

    public focusGraph(graph: AvailableGraph) {
        this.focusedGraph = graph;
    }

    private _scanForProblems() {
        const failedNodes = this._stateCounter.get(NodeState.startTaskFailed).getValue();
        const nodeCount = this.nodes.size;
        if (nodeCount > 0 && (failedNodes > 10 || failedNodes / nodeCount > 0.3)) {
            this.startTaskFailedError = {
                failedNodes, nodeCount,
            };
        } else {
            this.startTaskFailedError = null;
        }
    }

}
