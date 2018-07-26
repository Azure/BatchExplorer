import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Pool } from "app/models";
import * as pattern from "patternomaly";
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
export class PoolStateGraphComponent {
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
                stacked: true,
                gridLines: {
                    display: false,
                },
            }],
        },
    };

    constructor(private changeDetector: ChangeDetectorRef) {
        this._updateDataSets();
    }

    private _updateDataSets() {
        this.datasets = [

            {
                label: "Dedicated nodes",
                backgroundColor: colors,
                data: [4, 5, 6, 8],
                borderWidth: 0,
            },
            {
                label: "Low priority nodes",
                backgroundColor: lowPriColor,
                data: [9, 2, 0, 4],
                borderWidth: 0,
            },
        ];
        this.changeDetector.markForCheck();
    }
}
