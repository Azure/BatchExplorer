import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { DateUtils } from "@batch-flask/utils";
import { Job, Task } from "app/models";
import { Theme, ThemeService } from "app/services";
import { List } from "immutable";
import { DateTime } from "luxon";
import { Subscription } from "rxjs";

import "./tasks-running-time-graph.scss";

interface TaskPoint {
    task: Task;
    index: number;
}

export enum SortOption {
    default,
    startTime,
    endTime,
    node,
}

@Component({
    selector: "bl-tasks-running-time-graph",
    templateUrl: "tasks-running-time-graph.html",
})
export class TasksRunningTimeGraphComponent implements OnInit, OnChanges, OnDestroy {
    public SortOption = SortOption;

    @Input() public interactive: boolean = true;
    @Input() public job: Job;
    @Input() public tasks: List<Task> = List([]);

    public type = "scatter";

    public colors: any[] = [];

    public labels = null;

    public datasets: Chart.ChartDataSets[] = [];

    public options: Chart.ChartOptions;

    public loading = false;

    public sortControl = new FormControl(SortOption.default);

    private _failedTasks: TaskPoint[];
    private _succeededTasks: TaskPoint[];
    private _subs: Subscription[] = [];

    constructor(private router: Router, themeService: ThemeService) {
        this.updateOptions();
        this.updateData();
        this._subs.push(this.sortControl.valueChanges.subscribe(() => {
            this.updateData();
        }));
        this._subs.push(themeService.currentTheme.subscribe((theme) => {
            this._updateColors(theme);
        }));
    }

    public ngOnInit() {
        // Nothing
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
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
                    title: (tooltipItems, data) => {
                        return this._getToolTip(tooltipItems[0]);
                    },
                    label: () => null,
                },
            },
            scales: {
                xAxes: [{
                    display: false,
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
                    scaleLabel: {
                        display: true,
                        labelString: "Running time",
                    },
                }],
            },
        };
    }

    public updateData() {
        const succeededTasks = this._succeededTasks = [];
        const failedTasks = this._failedTasks = [];
        const sortedTasks = this._sortTasks();

        sortedTasks.forEach((task, index) => {
            if (!task.executionInfo || !task.executionInfo.endTime) {
                return;
            }
            if (task.executionInfo && task.executionInfo.exitCode !== 0) {
                failedTasks.push({ task, index });
            } else {
                succeededTasks.push({ task, index });
            }
        });
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

    public selectTask(el: any) {
        const task = this._getTaskAt(el._datasetIndex, el._index);
        this.router.navigate(["/jobs", this.job.id, "tasks", task.id]);
    }

    private _getTaskRunningTime(task: Task) {
        const { startTime, endTime } = task.executionInfo;
        return DateTime.fromJSDate(endTime).diff(DateTime.fromJSDate(startTime)).as("seconds");
    }

    private _tasksToDataPoints(tasks: TaskPoint[]) {
        return tasks.map(({ task, index }) => {
            return { x: index, y: this._getTaskRunningTime(task) };
        });
    }

    private _getToolTip(tooltipItem: Chart.ChartTooltipItem) {
        const task = this._getTaskAt(tooltipItem.datasetIndex, tooltipItem.index);
        if (!task) {
            return "???";
        }
        return [
            `Task id: ${task.id}`,
            `Runing time: ${DateUtils.prettyDuration(task.executionInfo.runningTime, true)}`,
            `Node id: ${task.nodeInfo.nodeId}`,
        ];
    }

    private _sortTasks() {
        switch (this.sortControl.value) {
            case SortOption.default:
                return this.tasks;
            case SortOption.startTime:
                return this.tasks.sort((a, b) => {
                    return a.executionInfo.startTime.getTime() - b.executionInfo.startTime.getTime();
                });
            case SortOption.endTime:
                return this.tasks.sort((a, b) => {
                    return a.executionInfo.endTime.getTime() - b.executionInfo.endTime.getTime();
                });
            case SortOption.node:
                return this.tasks.sort((a, b) => {
                    return a.nodeInfo.nodeId.localeCompare(b.nodeInfo.nodeId);
                });
            default:
                return this.tasks;
        }

    }

    /**
     * Return the task at the given index.
     * @param datasetIndex Datasetindex(0 for failed task 1 for successful)
     * @param index Index in the given dataset
     */
    private _getTaskAt(datasetIndex: number, index: number): Task {
        let point: TaskPoint = null;
        if (datasetIndex === 0) {
            point = this._failedTasks[index];
        } else {
            point = this._succeededTasks[index];
        }
        return point && point.task;
    }

    private _updateColors(theme: Theme) {
        this.colors = [
            {
                pointBackgroundColor: theme.danger.main,
                pointBorderColor: theme.danger.main,
            },
            {

                pointBackgroundColor: theme.success.main,
                pointBorderColor: theme.success.main,
            },
        ];
    }
}
