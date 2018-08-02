import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { FormControl } from "@angular/forms";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { PerformanceData } from "app/components/pool/graphs/performance-graph";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { Job, Node, NodeState, Pool, Task } from "app/models";
import {
    AppInsightsQueryService, BatchExplorerService, NodeListParams, NodeService,
} from "app/services";
import { ListView, PollObservable, PollService } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { StateCounter } from "./heatmap";
import { NodesStateHistoryData, RunningTasksHistoryData } from "./history-data";
import "./pool-graphs.scss";

const historyLength = {
    TenMinute: 10,
    OneHour: 60,
    OnDay: 60 * 24,
    OnWeek: 60 * 24 * 7,
};

const refreshRate = 5000;
const appInsightsRefreshRate = 60 * 1000; // Every minute(Aggregation is minimum 1 min)

@Component({
    selector: "bl-pool-graphs",
    templateUrl: "pool-graphs.html",
})
export class PoolGraphsComponent implements OnChanges, OnDestroy {
    public historyLength = historyLength;

    @Input() public pool: Pool;
    @Input() public node: Node;

    public data: ListView<Node, NodeListParams>;

    public nodes: List<Node> = List([]);
    /**
     * List of jobs running on this pool
     */
    public jobs: List<Job> = List([]);
    public tasks: List<Task> = List([]);

    public startTaskFailedError: any;
    public isPaasPool: boolean = false;

    public runningTaskHistory = new RunningTasksHistoryData();
    public runningNodesHistory = new NodesStateHistoryData([NodeState.running, NodeState.idle]);
    public maxRunningTasks = 0;

    public selectedHistoryLength = new FormControl(historyLength.TenMinute);
    public performanceData: PerformanceData;

    private _stateCounter = new StateCounter();

    private _polls: PollObservable[] = [];
    private _nodesSub: Subscription;
    private _appInsightsPoll: PollObservable;

    constructor(
        appInsightsQueryService: AppInsightsQueryService,
        private pollService: PollService,
        private nodeService: NodeService,
        private batchExplorer: BatchExplorerService,
        private sidebarManager: SidebarManager,
    ) {
        this.performanceData = new PerformanceData(appInsightsQueryService);
        this.data = nodeService.listView({
            pageSize: 1000,
            select: "id,state,runningTasksCount,isDedicated",
        });
        this._nodesSub = this.data.items.subscribe((nodes) => {
            this.nodes = nodes;

            if (nodes.size !== 0) {
                this._stateCounter.updateCount(nodes);
                this.runningNodesHistory.update(this.nodes);
                this.runningTaskHistory.update(this.nodes);
            }
            this._scanForProblems();
        });

        this.selectedHistoryLength.valueChanges.subscribe((value) => {
            this.runningNodesHistory.setHistorySize(value);
            this.runningTaskHistory.setHistorySize(value);
            this.performanceData.historySize = value;
            this.performanceData.update();
        });

        this._appInsightsPoll = this.pollService.startPoll("pool-app-insights", appInsightsRefreshRate, () => {
            return this.performanceData.update();
        });
        this._startListNodePoll();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.pool) {
            this.performanceData.pool = this.pool;
            this.maxRunningTasks = this.pool ? this.pool.targetNodes * this.pool.maxTasksPerNode : 0;
            this.isPaasPool = Boolean(this.pool.cloudServiceConfiguration);
            if (ComponentUtils.recordChangedId(changes.pool) && !this.node) {
                this.performanceData.update();
                this.data.params = { poolId: this.pool.id };
                this.data.refreshAll(false);

                this.runningNodesHistory.reset();
                this.runningTaskHistory.reset();
            }
        }

        if (changes.node) {
            this.performanceData.node = this.node;
            if (ComponentUtils.recordChangedId(changes.node)) {
                this.performanceData.update();
            }

            if (this.node) {
                this._stopListNodePoll();
            } else {
                this._startListNodePoll();
            }
        }
    }

    public ngOnDestroy() {
        this._stopListNodePoll();
        this._appInsightsPoll.destroy();
        this._nodesSub.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public openEditStartTask() {
        const ref = this.sidebarManager.open(`edit-start-task-${this.pool.id}`, StartTaskEditFormComponent);
        ref.component.pool = this.pool;
    }

    @autobind()
    public rebootFailedNodes() {
        this.nodeService.rebootAll(this.pool.id, [NodeState.startTaskFailed]);
    }

    @autobind()
    public reimageFailedNodes() {
        this.nodeService.reimageAll(this.pool.id, [NodeState.startTaskFailed]);
    }

    @autobind()
    public openInNewWindow() {
        const link = `ms-batch-explorer://route/standalone/pools/${this.pool.id}/graphs?fullscreen=true`;
        const window = this.batchExplorer.openNewWindow(link);

        return from(window.domReady);
    }

    public get appInsightsEnabled() {
        return Boolean(this.performanceData.appId);
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

    private _startListNodePoll() {
        this._polls.push(this.data.startPoll(refreshRate, true));
    }

    private _stopListNodePoll() {
        this._polls.forEach(x => x.destroy());
        this._polls = [];
    }
}
