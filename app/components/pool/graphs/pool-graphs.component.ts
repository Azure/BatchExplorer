import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Job, JobState, Node, NodeState, Pool, Task } from "app/models";
import { JobService, NodeListParams, NodeService } from "app/services";
import { PollObservable, RxListProxy } from "app/services/core";
import { FilterBuilder } from "app/utils/filter-builder";
import { NodesStateHistoryData, RunningTasksHistoryData } from "./history-data";
import "./pool-graphs.scss";
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
    /**
     * List of jobs running on this pool
     */
    public jobs: List<Job> = List([]);
    public tasks: List<Task> = List([]);

    public startTaskFailedError: any;

    public runningTaskHistory = new RunningTasksHistoryData();
    public runningNodesHistory = new NodesStateHistoryData([NodeState.running, NodeState.idle]);
    public maxRunningTasks = 0;

    public focusedGraph = AvailableGraph.Heatmap;
    public selectedHistoryLength = new FormControl(HistoryLength.TenMinute);

    private _jobData: RxListProxy<{}, Job>;
    private _stateCounter = new StateCounter();

    private _poll: PollObservable;
    private _nodesSub: Subscription;

    constructor(
        private nodeService: NodeService,
        jobService: JobService,
        private router: Router,
    ) {
        this.data = nodeService.list(null, {
            pageSize: 1000,
            select: "id,state,runningTasksCount,isDedicated",
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
        this._jobData = jobService.list({
            select: "id",
        });

        this._jobData.items.subscribe((jobs) => {
            this.jobs = jobs;
        });

        this.selectedHistoryLength.valueChanges.subscribe((value) => {
            this.runningNodesHistory.setHistorySize(value);
            this.runningTaskHistory.setHistorySize(value);
        });
        this._poll = this.data.startPoll(refreshRate, true);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.pool) {
            const prev = changes.pool.previousValue;
            const cur = changes.pool.currentValue;
            this.maxRunningTasks = this.pool ? this.pool.targetNodes * this.pool.maxTasksPerNode : 0;
            if (prev && cur && prev.id === cur.id) {
                return;
            }
            this.data.updateParams({ poolId: this.pool.id });
            this.data.refreshAll(false);

            this._jobData.patchOptions({
                filter: this._buildJobFilter(),
            });
            this._jobData.refreshAll();
            this.runningNodesHistory.reset();
            this.runningTaskHistory.reset();
        }
    }

    public ngOnDestroy() {
        this._poll.destroy();
        this._nodesSub.unsubscribe();
        this.data.dispose();
        this._jobData.dispose();
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

    private _buildJobFilter(): string {
        return FilterBuilder.and(
            FilterBuilder.prop("state").eq(JobState.active),
            FilterBuilder.prop("executionInfo/poolId").eq(this.pool.id),
        ).toOData();
    }
}
