import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { GaugeConfig } from "app/components/base/graphs/gauge";
import { Job, Node, Pool, TaskState } from "app/models";
import { NodeListParams, NodeService, PoolParams, PoolService, TaskService } from "app/services";
import { PollObservable, PollService, RxEntityProxy, RxListProxy } from "app/services/core";

const refreshRate = 5000;

@Component({
    selector: "bl-job-progress-status",
    templateUrl: "job-progress-status.html",
})
export class JobProgressStatusComponent implements OnChanges, OnDestroy {
    @Input()
    public job: Job;

    @Input()
    public poolId: string;

    public nodes: List<Node> = List([]);
    public pool: Pool;

    public showAllPoolTasks = false;
    public runningTasksCount = 0;
    public maxRunningTasks = 0;
    public gaugeOptions: GaugeConfig;

    private data: RxListProxy<NodeListParams, Node>;
    private poolData: RxEntityProxy<PoolParams, Pool>;

    private _polls: PollObservable[] = [];
    private _subs: Subscription[] = [];
    private _runningTaskCountForJob: number = 0;

    constructor(
        poolService: PoolService,
        nodeService: NodeService,
        private taskService: TaskService,
        pollService: PollService,
    ) {
        this.poolData = poolService.get(null);
        this.data = nodeService.list(null, {
            pageSize: 1000,
            select: "id,state,runningTasksCount",
        });

        this.updateGaugeOptions();

        this._subs.push(this.poolData.item.subscribe((pool) => {
            this.pool = pool;
            this.maxRunningTasks = pool ? pool.targetNodes * pool.maxTasksPerNode : 1;
            this.updateGaugeOptions();
        }));

        this._subs.push(this.data.items.subscribe((nodes) => {
            if (this.nodes.size !== nodes.size) {
                this.poolData.refresh();
            }
            this.nodes = nodes;
            this.countRunningTasks();
            this.updateGaugeOptions();
        }));

        this._polls.push(this.data.startPoll(refreshRate));

        this._polls.push(pollService.startPoll("count-tasks", 10000, () => this._updateJobRunningTasks()));
    }

    public ngOnChanges(changes) {
        if (changes.poolId) {
            this.poolData.params = ({ id: this.poolId });
            this.poolData.refresh();
            this.data.updateParams({ poolId: this.poolId });
            this.data.refreshAll(false);
        }

        if (changes.job) {
            this._updateJobRunningTasks();
        }
    }

    public ngOnDestroy() {
        this._polls.forEach(x => x.destroy());
        this._subs.forEach(x => x.unsubscribe());
        this.poolData.dispose();
    }

    public countRunningTasks() {
        if (this.showAllPoolTasks) {
            const taskCountPerNode = this.nodes.map(x => x.runningTasksCount);
            this.runningTasksCount = taskCountPerNode.reduce((a, b) => a + b, 0);
        } else {
            this.runningTasksCount = this._runningTaskCountForJob;
        }
    }

    public updateGaugeOptions() {
        this.gaugeOptions = {
            min: 0,
            max: this.maxRunningTasks,
            title: "Running tasks",
            labels: {
                max: {
                    tooltip: `This pool allows for a total of ${this.maxRunningTasks} tasks to run simultaneously.`,
                },
            },
        };
    }

    public updateShowAllPoolTasks(value: boolean) {
        this.showAllPoolTasks = value;
        this.countRunningTasks();
        this.updateGaugeOptions();
    }

    private _updateJobRunningTasks() {
        const obs = this.taskService.countTasks(this.job.id, TaskState.running);

        obs.subscribe((x) => {
            this._runningTaskCountForJob = x;
            this.countRunningTasks();
        });
        return obs;
    }
}
