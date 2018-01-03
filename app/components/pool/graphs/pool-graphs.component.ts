import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "app/core";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { SidebarManager } from "app/components/base/sidebar";
import { PerformanceData } from "app/components/pool/graphs/performance-graph";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { Job, JobState, Node, NodeState, Pool, Task } from "app/models";
import { AppInsightsQueryService, JobListParams, JobService, NodeListParams, NodeService } from "app/services";
import { ListView, PollObservable, PollService } from "app/services/core";
import { FilterBuilder } from "app/utils/filter-builder";
import { StateCounter } from "./heatmap";
import { NodesStateHistoryData, RunningTasksHistoryData } from "./history-data";
import "./pool-graphs.scss";

enum AvailableGraph {
    Heatmap,
    AvailableNodes,
    RunningTasks,
    Cpu,
    Memory,
    Network,
    Disk,
    EnableAppInsights,
}

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
    public AvailableGraph = AvailableGraph;
    public historyLength = historyLength;

    @Input()
    public pool: Pool;

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

    public focusedGraph = AvailableGraph.Heatmap;
    public selectedHistoryLength = new FormControl(historyLength.TenMinute);
    public performanceData: PerformanceData;

    private _jobData: ListView<Job, JobListParams>;
    private _stateCounter = new StateCounter();

    private _polls: PollObservable[] = [];
    private _nodesSub: Subscription;

    constructor(
        appInsightsQueryService: AppInsightsQueryService,
        pollService: PollService,
        private nodeService: NodeService,
        jobService: JobService,
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
        this._jobData = jobService.listView({
            select: "id",
        });

        this._jobData.items.subscribe((jobs) => {
            this.jobs = jobs;
        });

        this.selectedHistoryLength.valueChanges.subscribe((value) => {
            this.runningNodesHistory.setHistorySize(value);
            this.runningTaskHistory.setHistorySize(value);
            this.performanceData.historySize = value;
            this.performanceData.update();
        });
        this._polls.push(this.data.startPoll(refreshRate, true));

        this._polls.push(pollService.startPoll("pool-app-insights", appInsightsRefreshRate, () => {
            return this.performanceData.update();
        }));
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.pool) {
            this.performanceData.pool = this.pool;
            const prev = changes.pool.previousValue;
            const cur = changes.pool.currentValue;
            this.maxRunningTasks = this.pool ? this.pool.targetNodes * this.pool.maxTasksPerNode : 0;
            this.isPaasPool = Boolean(this.pool.cloudServiceConfiguration);
            if (prev && cur && prev.id === cur.id) {
                return;
            }

            this._checkTabIsValid();

            this.performanceData.update();
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
        this._polls.forEach(x => x.destroy());
        this._nodesSub.unsubscribe();
        this.data.dispose();
        this._jobData.dispose();
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

    public focusGraph(graph: AvailableGraph) {
        this.focusedGraph = graph;
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

    private _buildJobFilter(): string {
        return FilterBuilder.and(
            FilterBuilder.prop("state").eq(JobState.active),
            FilterBuilder.prop("executionInfo/poolId").eq(this.pool.id),
        ).toOData();
    }

    private _checkTabIsValid() {
        if (this.appInsightsEnabled && this.focusedGraph === AvailableGraph.EnableAppInsights) {
            this.focusGraph(AvailableGraph.Heatmap);
        } else if (this.appInsightsEnabled
            && !(this.focusedGraph === AvailableGraph.EnableAppInsights
                || this.focusedGraph === AvailableGraph.Heatmap
                || this.focusedGraph === AvailableGraph.AvailableNodes
                || this.focusedGraph === AvailableGraph.RunningTasks)) {
            this.focusGraph(AvailableGraph.Heatmap);
        }
    }
}
