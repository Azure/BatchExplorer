import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DateUtils } from "@batch-flask/utils";
import { Job, Task } from "app/models";
import { NumberUtils } from "app/utils";
import { List } from "immutable";
import { DateTime, Duration } from "luxon";

import "./job-progress-graph.scss";

@Component({
    selector: "bl-job-progress-graph",
    templateUrl: "job-progress-graph.html",
})
export class JobProgressGraphComponent implements OnChanges {

    @Input() public interactive: boolean = true;
    @Input() public job: Job;
    @Input() public tasks: List<Task> = List([]);

    public type = "line";

    public colors: any[] = [
        {
            backgroundColor: "rgba(76, 175, 80, 0.4)",
            pointBackgroundColor: "var(--accent-color)", // End time colors(green)
            pointBorderColor: "var(--accent-color)",
        },
        {
            backgroundColor: "rgba(76, 175, 80, 0.4)",
            pointBackgroundColor: "var(--accent-color)", // End time colors(green)
            pointBorderColor: "(--accent-color)",
        },
    ];

    public datasets: Chart.ChartDataSets[] = [];

    public options: Chart.ChartOptions;

    public loading = false;

    private _sortedEndTimes: any[];
    private _sortedStartTimes: any[];

    constructor() {
        this.updateOptions();
        this.updateData();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.tasks) {
            this.updateData();
        }
    }

    public updateOptions() {
        const hitRadius = this.interactive ? 5 : 0;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            legend: {
                display: false,
            },
            elements: {
                point: {
                    radius: 0,
                    hitRadius: hitRadius,
                    hoverRadius: hitRadius,
                },
            },
            hover: {
                mode: "nearest",
                intersect: true,
            },
            tooltips: {
                enabled: true,
                mode: "nearest",
                callbacks: {
                    title: (tooltipItems, data) => {
                        return this._getToolTip(tooltipItems[0]);
                    },
                    label: () => null,
                },
            },
            scales: {
                xAxes: [{
                    type: "linear",
                    position: "bottom",
                    ticks: {
                        min: 0,
                        callback: (value: number) => {
                            const seconds = Math.floor(value / 1000);
                            if (seconds > 180) {
                                if (seconds % 60 === 0) {
                                    return seconds / 60 + "m";
                                }
                            } else {
                                if (seconds % 1 === 0) {
                                    return seconds + "s";
                                }
                            }
                        },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Time since the job started.",
                    },
                }],
                yAxes: [{
                    type: "linear",
                    scaleLabel: {
                        display: true,
                        labelString: "Task count",
                    },
                }],
            },
        };
    }

    public updateData() {
        if (!this.job) {
            return;
        }
        const jobStartTime = DateTime.fromJSDate(this.job.executionInfo.startTime);
        const startTimes = [];
        const endTimes = [];
        this.tasks.forEach((task, index) => {
            if (!task.executionInfo || !task.executionInfo.endTime) {
                return;
            }
            const { startTime, endTime } = task.executionInfo;

            startTimes.push({
                time: DateTime.fromJSDate(startTime).diff(jobStartTime).as("milliseconds"),
                index: index,
                task: task,
            });

            endTimes.push({
                time: DateTime.fromJSDate(endTime).diff(jobStartTime).as("milliseconds"),
                index: index,
                task: task,
            });
        });

        const sortedStartTimes = this._sortedStartTimes = startTimes.sort((a, b) => a.time - b.time);
        const sortedEndTimes = this._sortedEndTimes = endTimes.sort((a, b) => a.time - b.time);

        this.datasets = [
            {
                label: "Starttime",
                data: this._timesToDataSet(sortedStartTimes),
                fill: "1",
            },
            {
                label: "EndTime",
                data: this._timesToDataSet(sortedEndTimes),
                fill: false,
            },
        ] as any;
    }

    private _getToolTip(tooltipItem: Chart.ChartTooltipItem) {
        const { xLabel, yLabel } = tooltipItem;
        const x = typeof xLabel === "string" ? parseInt(xLabel, 10) : xLabel;
        let type: string;
        let task: Task;
        const time = DateUtils.prettyDuration(Duration.fromObject({ milliseconds: x }), true);
        if (tooltipItem.datasetIndex === 0) {
            task = this._sortedStartTimes[tooltipItem.index].task;
            type = "task started ";
        } else {
            task = this._sortedEndTimes[tooltipItem.index].task;
            type = "task completed";
        }

        const taskCount = typeof yLabel === "string" ? parseInt(yLabel, 10) : yLabel;
        const taskId = task ? task.id : "?";
        return [`${NumberUtils.nth(taskCount)} ${type} at ${time}`, `Task id: ${taskId}`];
    }

    private _timesToDataSet(times: any[]) {
        return times.map((data, index) => {
            return {
                y: index,
                x: Math.round(data.time),
            };
        });
    }
}
