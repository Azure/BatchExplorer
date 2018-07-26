import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { Pool } from "app/models";
import { NodeCounts, NodeCountsAttributes, PoolNodeCountService, PoolNodeCounts } from "app/services";
import * as pattern from "patternomaly";
import { Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui";
import "./pool-state-graph.scss";

const idleColor = "#edeef2";
const runningColor = "#388e3c";
const waitingForStartTaskColor = "#be93d9";
const offlineColor = "#305796";
const preemptedColor = "#606060";
const transitionColor = "#ffcc5c";
const errorColor = "#aa3939";

const colors = [
    idleColor,
    runningColor,
    waitingForStartTaskColor,
    offlineColor,
    preemptedColor,
    transitionColor,
    errorColor,
];

const lowPriColor = colors.map(x => pattern.draw("diagonal", x));
@Component({
    selector: "bl-pool-state-graph",
    templateUrl: "pool-state-graph.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolStateGraphComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public pool: Pool;

    public datasets: Chart.ChartDataSets[] = [];

    public labels = [
        "Idle",
        "Running",
        "WaitingForStartTask",
        "Offline",
        "Preempted",
        "Transitioning",
        "Error",
    ];

    public options: Chart.ChartOptions = {
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        scales: {
            xAxes: [{
                categoryPercentage: 1.0,
                barPercentage: 0.9,
                stacked: true,
                gridLines: {
                    display: false,
                },
                ticks: {
                    display: false,
                },
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: value => { if (value % 1 === 0) { return value; } },
                },
                stacked: true,
                gridLines: {
                    display: false,
                },
            }],
        },
    };

    private _sub: Subscription;
    private _counts: Map<string, PoolNodeCounts>;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private poolNodeCountSerivce: PoolNodeCountService,
        private contextMenuService: ContextMenuService) {
        this._updateDataSets();

        this._sub = poolNodeCountSerivce.counts.subscribe((counts) => {
            this._counts = counts;
            this._updateDataSets();
        });
    }

    public ngOnInit() {
        this.poolNodeCountSerivce.refresh();
    }

    public ngOnChanges(changes) {
        if (changes.pool) {
            this._updateDataSets();
        }
    }
    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @HostListener("contextmenu")
    public showContextMenu() {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem({ label: "Refresh", click: () => this.poolNodeCountSerivce.refresh() }),
        ]));
    }

    private _updateDataSets() {
        const counts = this._getCounts();
        this.datasets = [

            {
                label: "Dedicated nodes",
                backgroundColor: colors,
                data: this._getData(counts && counts.dedicated),
                borderWidth: 0,
            },
            {
                label: "Low priority nodes",
                backgroundColor: lowPriColor,
                data: this._getData(counts && counts.lowPriority),
                borderWidth: 0,
            },
        ];
        this.changeDetector.markForCheck();
    }

    private _getCounts(): PoolNodeCounts | null {
        if (!this._counts) { return null; }
        if (this.pool) {
            return this._counts.get(this.pool.id);
        }
        // TODO do sum

        const dedicatedCounts: NodeCountsAttributes = new NodeCounts().toJS();
        const lowPriorityCounts: NodeCountsAttributes = new NodeCounts().toJS();

        for (const count of this._counts.values()) {
            this._addToSum(dedicatedCounts, count.dedicated);
            this._addToSum(lowPriorityCounts, count.lowPriority);
        }

        return new PoolNodeCounts({ dedicated: dedicatedCounts, lowPriority: lowPriorityCounts });
    }

    private _getData(counts: NodeCounts) {
        if (!counts) { return []; }
        return [
            counts.idle,
            counts.running,
            counts.waitingForStartTask,
            counts.offline,
            counts.preempted,
            counts.transitioning,
            counts.error,
        ];
    }

    private _addToSum(sum: NodeCountsAttributes, count: NodeCounts) {
        sum.creating += count.creating;
        sum.idle += count.idle;
        sum.leavingPool += count.leavingPool;
        sum.offline += count.offline;
        sum.preempted += count.preempted;
        sum.rebooting += count.rebooting;
        sum.reimaging += count.reimaging;
        sum.running += count.running;
        sum.startTaskFailed += count.startTaskFailed;
        sum.starting += count.starting;
        sum.total += count.total;
        sum.unknown += count.unknown;
        sum.unusable += count.unusable;
        sum.waitingForStartTask += count.waitingForStartTask;
    }
}
