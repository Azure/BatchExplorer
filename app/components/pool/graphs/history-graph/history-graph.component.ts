import { Component, Input, OnChanges } from "@angular/core";
import * as moment from "moment";

@Component({
    selector: "bl-history-graph",
    templateUrl: "history-graph.html",
})
export class HistoryGraphComponent implements OnChanges {
    @Input()
    public max: number = 1;

    @Input()
    public history: any[] = [];

    public type = "line";

    public data: any = [];

    public options = {};

    constructor() {
        this.updateData();
        this.updateOptions();
    }

    public ngOnChanges(inputs) {
        if (inputs.history) {
            this.updateData();
            this.updateOptions();
        }

        if (inputs.max) {
            this.updateOptions();
        }
    }

    public updateOptions() {
        this.options = {
            responsive: true,
            elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 10 } },
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: "Last 10min",
                position: "bottom",
                padding: 5,
                fontStyle: "",
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    ticks: {
                        max: this.max,
                        min: 0,
                        autoSkip: true,
                        callback: (value) => { if (value % 1 === 0) { return value; } },
                    },
                }],
                xAxes: [{
                    type: "time",
                    display: false,
                }],
            },
        };
    }
    public updateData() {
        this.data = [
            {
                data:
                [
                    { x: moment().subtract(10, "minutes").toDate(), y: null },
                    ...this.history,
                ],
            },
        ];
    }
}
