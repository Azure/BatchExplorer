import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { GaugeConfig } from "app/components/base/graphs/gauge";
import { Job, Node, Pool } from "app/models";
import { NodeListParams, NodeService, PoolParams, PoolService } from "app/services";
import { PollObservable, RxEntityProxy, RxListProxy } from "app/services/core";

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

    constructor(poolService: PoolService, nodeService: NodeService) {
        this.poolData = poolService.get(null);
        this.data = nodeService.list(null, {
            pageSize: 1000,
            select: "recentTasks,id,state",
        });

        this.updateGaugeOptions();

        this._subs.push(this.poolData.item.subscribe((pool) => {
            this.pool = pool;
            this.maxRunningTasks = pool ? pool.targetDedicated * pool.maxTasksPerNode : 1;
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
    }

    public ngOnChanges(changes) {
        if (changes.poolId) {
            this.poolData.params = ({ id: this.poolId });
            this.poolData.refresh();
            this.data.updateParams({ poolId: this.poolId });
            this.data.refresh(false);
        }
    }

    public ngOnDestroy() {
        this._polls.forEach(x => x.destroy());
        this._subs.forEach(x => x.unsubscribe());
    }

    public countRunningTasks() {
        let taskCountPerNode;
        if (this.showAllPoolTasks) {
            taskCountPerNode = this.nodes.map(x => x.runningTasks.size);
        } else {
            taskCountPerNode = this.nodes.map(x => x.runningTasks.filter(task => task.jobId === this.job.id).size);
        }

        this.runningTasksCount = taskCountPerNode.reduce((a, b) => a + b, 0);
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
}
