import { Component, Input, OnChanges } from "@angular/core";
import * as Chartist from "chartist";
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

    public type = "Line";

    public data: any = {};

    public options = {};

    constructor() {
        this.updateData();
        this.updateOptions();
    }

    public ngOnChanges(inputs) {
        if (inputs.history) {
            this.updateData();
        }

        if (inputs.max) {
            this.updateOptions();
        }
    }

    public updateOptions() {
        this.options = {
            showPoint: false,
            fullWidth: true,
            divisor: 2,
            low: 0,
            high: this.max,
            chartPadding: {
                right: 20,
            },
            axisX: {
                type: Chartist.FixedScaleAxis,
                divisor: 1,
                labelInterpolationFnc: (value) => {
                    return moment(value).fromNow();
                },
            },
        };
    }
    public updateData() {
        this.data = {
            series: [
                [
                    { x: moment().subtract(10, "minutes").toDate(), y: null },
                    ...this.history,
                ],
            ],
        };
    }
}
