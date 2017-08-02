import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";

import { Job, Task, TaskState } from "app/models";
import { TaskService } from "app/services";
import { log } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
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

    private _tasks: List<Task> = List([]);
    private _failedTasks: TaskPoint[];
    private _succeededTasks: TaskPoint[];

    constructor(private taskService: TaskService) {
        const tasks = [];
        this._tasks = List(tasks);
        this.updateOptions();
        this.updateData();
    }

    public ngOnInit() {
        // Nothing
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.job) {

            const { previousValue, currentValue } = changes.job;
            if (!previousValue || previousValue.id !== currentValue.id) {
                this.updateTasks();
            }
        }
    }

    public updateTasks() {
        console.time("update-task");
        this.loading = true;
        this.taskService.listAll(this.job.id, {
            select: "id,executionInfo",
            filter: FilterBuilder.prop("state").eq(TaskState.completed).toOData(),
            pageSize: 1000,
        }).subscribe({
            next: (tasks) => {
                console.log("Got all tasks", tasks.size);
                console.timeEnd("update-task");
                console.time("update-data");

                this.loading = false;
                this._tasks = tasks;
                this.updateData();
                console.timeEnd("update-data");

            },
            error: (error) => {
                log.error(`Error retrieving all tasks for job ${this.job.id}`, error);
            },
        });
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
        this._tasks.forEach((task, index) => {
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
