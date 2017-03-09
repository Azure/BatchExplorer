import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Node, NodeState, Pool } from "app/models";
import { NodeListParams, NodeService } from "app/services";
import { RxListProxy } from "app/services/core";
import { StateCounter } from "./state-counter";

const refreshRate = 5000;
@Component({
    selector: "bl-pool-graphs",
    templateUrl: "pool-graphs.html",
})
export class PoolGraphsComponent implements OnChanges, OnDestroy {
    @Input()
    public pool: Pool;

    public data: RxListProxy<NodeListParams, Node>;

    public nodes: List<Node> = List([]);
    public startTaskFailedError: any;

    private _stateCounter = new StateCounter();

    private _refreshInterval: any;
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
            }
            this._scanForProblems();
        });

        this._refreshInterval = setInterval(() => {
            this.data.refresh(false);
        }, refreshRate);
    }

    public ngOnChanges(changes) {
        if (changes.pool) {
            this.data.updateParams({ poolId: this.pool.id });
            // this.data.fetchNext(true);
            this.data.refresh(false);
        }
    }

    public ngOnDestroy() {
        clearInterval(this._refreshInterval);
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
