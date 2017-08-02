import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";

import { Job, Task } from "app/models";
import "./tasks-running-time-graph.scss";

interface TaskPoint {
    task: Task;
    index: number;
}

@Component({
    selector: "bl-tasks-running-time-graph",
    templateUrl: "tasks-running-time-graph.html",
})
export class TasksRunningTimeGraphComponent implements OnInit, OnChanges {

    @Input() public interactive: boolean = true;
    @Input() public job: Job;
    @Input() public tasks: List<Task> = List([]);

    public type = "scatter";

    public colors: any[] = [
        {
            pointBackgroundColor: "#aa3939",
            pointBorderColor: "#aa3939",
        },
        {

            pointBackgroundColor: "#4caf50",
            pointBorderColor: "#4caf50",
        },
    ];

    public datasets: Chart.ChartDataSets[] = [];

    public options: Chart.ChartOptions;

    public loading = false;

    private _failedTasks: TaskPoint[];
    private _succeededTasks: TaskPoint[];

    constructor() {
        this.updateOptions();
        this.updateData();
    }

    public ngOnInit() {
        // Nothing
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.tasks) {
            this.updateData();
        }
    }

    public updateOptions() {
        const hitRadius = this.interactive ? 3 : 0;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            legend: {
                display: false,
            },
            elements: {
                point: {
                    radius: 1,
                    hitRadius: hitRadius,
                    hoverRadius: hitRadius,
                },
                line: {
                    backgroundColor: "rgba(0, 0, 0 ,0)",
                    borderWidth: 0,
                    borderColor: "rgba(0, 0, 0, 0)",
                    fill: false,
                },
            },
            tooltips: {
                enabled: true,
                mode: "single",
                callbacks: {
                    label: (tooltipItems, data) => {
                        return this._getToolTip(tooltipItems.datasetIndex, tooltipItems.index);
                    },
                },
            },
            scales: {
                xAxes: [{
                    type: "linear",
                    position: "bottom",
                }],
                yAxes: [{
                    type: "linear",
                    ticks: {
                        min: 0,
                        callback: (value) => {
                            if (value > 180) {
                                if (value % 60 === 0) {
                                    return value / 60 + "m";
                                }
                            } else {
                                if (value % 1 === 0) {
                                    return value + "s";
                                }
                            }
                        },
                    },
                }],
            },
        };
    }

    public updateData() {
        const succeededTasks = this._succeededTasks = [];
        const failedTasks = this._failedTasks = [];
        this.tasks.forEach((task, index) => {
            if (!task.executionInfo || !task.executionInfo.endTime) {
                return;
            }
            if (task.executionInfo && task.executionInfo.exitCode !== 0) {
                failedTasks.push({ task, index });
            } else {
                succeededTasks.push({ task, index });
            }
        });
        console.log("Succ", succeededTasks, failedTasks);
        this.datasets = [
            {
                label: "Failed tasks",
                data: this._tasksToDataPoints(failedTasks),
                radius: 2,
            } as any,
            {
                label: "Succeded tasks",
                data: this._tasksToDataPoints(succeededTasks),
            },
        ];
    }

    private _getTaskRunningTime(task: Task) {
        const { startTime, endTime } = task.executionInfo;
        return Math.round(moment(endTime).diff(moment(startTime)) / 1000);
    }

    private _tasksToDataPoints(tasks: TaskPoint[]) {
        return tasks.map(({ task, index }) => {
            return { x: index, y: this._getTaskRunningTime(task) };
        });
    }

    private _getToolTip(datasetIndex: number, index: number) {
        let point: TaskPoint = null;
        if (datasetIndex === 0) {
            point = this._failedTasks[index];
        } else {
            point = this._succeededTasks[index];
        }

        if (!point) {
            return "???";
        }
        return point.task.id;
    }
}
