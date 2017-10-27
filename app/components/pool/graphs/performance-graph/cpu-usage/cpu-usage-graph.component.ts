import { ChangeDetectorRef, Component, OnChanges } from "@angular/core";
import { AppInsightsPerformanceMetrics } from "../performance-data";
import { BatchUsageMetrics, PerformanceGraphComponent } from "../performance-graph.component";

export class BasePerformanceData {
    public max = undefined;
    public unit = "";
}

import "./cpu-usage-graph.scss";

interface CpuUsage {
    time: Date;
    value: number;
    cpuCount: number;
    usages: number[];
}

@Component({
    selector: "bl-cpu-usage-graph",
    templateUrl: "cpu-usage-graph.html",
})
export class CpuUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public max = 100;
    public unit = "%";
    public metric = BatchUsageMetrics.cpu;

    public cpuUsages: CpuUsage[] = [];
    public showOverallUsage = true;
    public lastCpuUsage: CpuUsage;

    constructor(private changeDetector: ChangeDetectorRef) {
        super();
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._metricSubs.push(this.data.observeMetric(AppInsightsPerformanceMetrics.cpuUsage).subscribe((data) => {
                console.log("Got data?", data);
                this.cpuUsages = data.map((usage) => {
                    const details = JSON.parse(usage.details);
                    return {
                        time: usage.time,
                        value: usage.value,
                        cpuCount: Number(details["cpu_count"]),
                        usages: this._parseIndividualCpuUsage(details["usages"]),
                    };
                });
                this.lastCpuUsage = this.cpuUsages.last();
                this.updateData();
            }));
        }
    }

    public updateData() {
        if (this.showOverallUsage) {
            this._showOverallCpuUsage();
        } else {
            this._showIndiviualCpuUsage();
        }
    }

    public changeShowOverallUsage(newValue) {
        console.log("Change show oevrral", newValue);
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _parseIndividualCpuUsage(value: string) {
        return value.split(",").map(x => Number(x));
    }
    private _showOverallCpuUsage() {
        console.log("Show oeveral cpu");
        this.datasets = [
            {
                data: [
                    ...this.cpuUsages.map(x => {
                        return {
                            x: x.time,
                            y: x.value,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
            },
        ];
        this.changeDetector.detectChanges();
    }

    private _showIndiviualCpuUsage() {
        if (this.cpuUsages.length === 0) {
            this._showOverallCpuUsage();
            return;
        }

        const cpuCount = this.cpuUsages.first().cpuCount;

        this.datasets = new Array(cpuCount).fill(0).map((_, cpuN) => {
            return {
                data: this.cpuUsages.map(x => {
                    return {
                        x: x.time,
                        y: x.usages[cpuN],
                    };
                }),
                fill: false,
                borderWidth: 1,
            };
        });
        this.changeDetector.markForCheck();
        this.changeDetector.detectChanges();
    }
}
