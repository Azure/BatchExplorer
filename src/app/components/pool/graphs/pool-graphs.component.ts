import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ListView, PollObservable, PollService, autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { PerformanceData } from "app/components/pool/graphs/performance-graph";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { BatchPerformanceMetrics, Job, Node, NodeState, Pool, Task } from "app/models";
import {
    AppInsightsQueryService, BatchExplorerService, NodeListParams, NodeService,
} from "app/services";
import { ComponentUtils, PoolUtils } from "app/utils";
import { List } from "immutable";
import { Subject, from } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolGraphsComponent implements OnChanges, OnDestroy {

    public get appInsightsEnabled() {
        return Boolean(this.performanceData.appId);
    }
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
    public unusableNodeError: any;
    public isPaasPool: boolean = false;
    public hasGPU: boolean = false;

    public runningTaskHistory = new RunningTasksHistoryData();
    public runningNodesHistory = new NodesStateHistoryData([NodeState.running, NodeState.idle]);
    public maxRunningTasks = 0;

    public selectedHistoryLength = new FormControl(historyLength.TenMinute);
    public performanceData: PerformanceData;
    public performanceMetrics: BatchPerformanceMetrics;

    private _stateCounter = new StateCounter();

    private _polls: PollObservable[] = [];
    private _destroy = new Subject();
    private _appInsightsPoll: PollObservable;

    constructor(
        appInsightsQueryService: AppInsightsQueryService,
        private changeDetector: ChangeDetectorRef,
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
        this.data.items.pipe(takeUntil(this._destroy)).subscribe((nodes) => {
            this.nodes = nodes;
            this.changeDetector.markForCheck();

            if (nodes.size !== 0) {
                this._stateCounter.updateCount(nodes);
                this.runningNodesHistory.update(this.nodes);
                this.runningTaskHistory.update(this.nodes);
            }
            this._scanForProblems();
        });

        this.performanceData.metrics.pipe(takeUntil(this._destroy)).subscribe((value) => {
            this.performanceMetrics = value;
            this.changeDetector.markForCheck();
        });

        this.selectedHistoryLength.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
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

            this.hasGPU = PoolUtils.hasGPU(this.pool);
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
        this.data.dispose();
        this._destroy.next();
        this._destroy.complete();
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

    private _scanForProblems() {
        const failedStartTaskNodes = this._stateCounter.get(NodeState.startTaskFailed).getValue();
        const failedUnusableNodes = this._stateCounter.get(NodeState.unusable).getValue();

        const nodeCount = this.nodes.size;

        const isStartTaskError: Boolean = failedStartTaskNodes > 10 || failedStartTaskNodes / nodeCount > 0.3;
        const isUnusableError: Boolean = failedUnusableNodes > 10 || failedUnusableNodes / nodeCount > 0.3;

        if ((!isStartTaskError && !isUnusableError) || nodeCount <= 0) {
            this.startTaskFailedError = null;
            this.unusableNodeError = null;
        } else {

            if (isStartTaskError && !isUnusableError) {
                this.startTaskFailedError = {
                    failedStartTaskNodes, nodeCount,
                };
            } else if (!isStartTaskError && isUnusableError) {
                this.unusableNodeError = {
                    failedUnusableNodes, nodeCount,
                };
            } else {
                this.startTaskFailedError = {
                    failedStartTaskNodes, nodeCount,
                };
                this.unusableNodeError = {
                    failedUnusableNodes, nodeCount,
                };
            }
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
