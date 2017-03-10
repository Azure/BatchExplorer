import { Component, Input, OnChanges } from "@angular/core";
import * as Chartist from "chartist";
import { List } from "immutable";
import * as moment from "moment";

import { Node, Pool } from "app/models";

@Component({
    selector: "bl-running-task-history",
    templateUrl: "running-task-history.html",
})
export class RunningTaskHistoryComponent implements OnChanges {
    @Input()
    public pool: Pool;

    @Input()
    public nodes: List<Node>;

    public type = "Line";

    public data: any = {};
    public options: any;

    private _data: any[] = [];

    private _latest = 0;

    constructor() {
        this.options = {
            showPoint: false,
            fullWidth: true,
            divisor: 2,
            low: 0,
            high: 10,
            chartPadding: {
                right: 20,
            },
            axisX: {
                // offset: 0,
                type: Chartist.FixedScaleAxis,
                divisor: 1,
                labelInterpolationFnc: (value) => {
                    return moment(value).fromNow();
                },
            },
            axisY: {
                // offset: 0,
                // showLabel: false,
            },
        };
        this.updateData();
    }

    public ngOnChanges(inputs) {
        if (inputs.nodes) {
            // const runningTask = this.nodes.map(x => x.runningTasks.size).reduce((a, b) => a + b, 0);
            const time = new Date();
            const diff = (Math.random() * 3) - 2;
            const runningTask = Math.min(Math.max(this._latest + diff, 0), 10);
            this._latest = runningTask;
            this._data.push({
                x: time,
                y: runningTask,
            });
            this._cleanupData();
            this.updateData();
        }
    }

    public updateData() {
        this.data = {
            series: [
                [
                    { x: moment().subtract(10, "minutes").toDate(), y: null },
                    ...this._data,
                ],
            ],
        };
    }

    private _cleanupData() {
        const maxTime = moment().subtract(10, "minutes");
        while (true) {
            const data = this._data.first();
            const diff = moment(data.x).diff(maxTime);
            if (diff < 0) {
                this._data.shift();
            } else {
                break;
            }
        }
    }
}
