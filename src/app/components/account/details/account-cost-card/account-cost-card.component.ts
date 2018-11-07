import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { BatchAccountService } from "app/services";
import { ConsumptionMeterDetails, UsageDetail, UsageDetailsService } from "app/services/azure-consumption";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import "./account-cost-card.scss";

const colors = [
    "#61afef",
    "#aa3939",
    "#4caf50",
    "#f4ad42",
    "#a569bd",
];
@Component({
    selector: "bl-account-cost-card",
    templateUrl: "account-cost-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCostCardComponent implements OnInit, OnDestroy {

    public chartType = "line";
    public datasets: Chart.ChartDataSets[] = [];
    // public labels: string[] = [];
    public options: Chart.ChartOptions = {};

    private _destroy = new Subject();

    constructor(
        private usageService: UsageDetailsService,
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this.accountService.currentAccount.pipe(takeUntil(this._destroy)).subscribe(() => {
            this._updateUsages();
        });
        this._setChartOptions();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    private _updateUsages() {
        this.usageService.getUsage().subscribe((usages: UsageDetail[]) => {
            this._computeDataSets(usages);
        });
    }

    private _computeDataSets(usages: UsageDetail[]) {
        const groups: StringMap<{ meterDetails: ConsumptionMeterDetails, usages: any }> = {

        };
        for (const usage of usages) {
            const meterId = usage.properties.meterId;

            if (!(meterId in groups)) {
                groups[meterId] = {
                    meterDetails: usage.properties.meterDetails,
                    usages: [],
                };
            }

            groups[meterId].usages.push({
                x: usage.properties.usageStart,
                y: usage.properties.pretaxCost,
            });
        }
        this.datasets = Object.values(groups).map((data, i) => {
            return {
                label: data.meterDetails.meterName,
                backgroundColor: colors[i],
                borderColor: colors[i],
                data: data.usages,
            };
        });
        this.changeDetector.markForCheck();
    }

    private _setChartOptions() {
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 3,
                },
                line: {
                    tension: 0.05,
                    borderWidth: -10,
                },
            },
            scales: {
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                    },
                }],
                xAxes: [{
                    stacked: true,
                    type: "time",
                    position: "bottom",
                    time: {
                        unit: "day",
                        unitStepSize: 1,
                        displayFormats: {
                            day: "MMM DD",
                        },
                    },
                }],
            },
        };
        this.changeDetector.markForCheck();
    }
}
