import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { BatchAccountService } from "app/services";
import {
    ConsumptionMeterDetails, UsageDetail, UsageDetailsService, UsageDetailsUnsupportedSubscription,
} from "app/services/azure-consumption";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { log } from "@batch-flask/utils";
import { ArmBatchAccount } from "app/models";
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
    public options: Chart.ChartOptions = {};
    public currency: string;
    public isArmBatchAccount: boolean;
    public unsupportedSubscription: boolean;
    public total: string;

    private _destroy = new Subject();

    constructor(
        private usageService: UsageDetailsService,
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this.accountService.currentAccount.pipe(takeUntil(this._destroy)).subscribe((account) => {
            this.isArmBatchAccount = account instanceof ArmBatchAccount;
            if (this.isArmBatchAccount) {
                this._updateUsages();
            } else {
                this.unsupportedSubscription = false;
            }
            this.changeDetector.markForCheck();
        });
        this._setChartOptions();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    private _updateUsages() {
        this.unsupportedSubscription = false;
        this.changeDetector.markForCheck();

        this.usageService.getUsage().subscribe({
            next: (usages: UsageDetail[]) => {
                this._computeDataSets(usages);
            },
            error: (error) => {
                if (error instanceof UsageDetailsUnsupportedSubscription) {
                    this.unsupportedSubscription = true;
                    this.changeDetector.markForCheck();
                } else {
                    log.error("Error retrieving cost", error);
                }
            },
        });
    }

    private _computeDataSets(usages: UsageDetail[]) {
        const groups: StringMap<{ meterDetails: ConsumptionMeterDetails, usages: any }> = {

        };

        if (usages.length > 0) {
            this.currency = usages.first().properties.currency;
        }

        let total = 0;

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
            total += usage.properties.pretaxCost;
        }
        this.total = total.toFixed(2);
        this.datasets = Object.values(groups).map((data, i) => {
            return {
                label: data.meterDetails.meterName,
                backgroundColor: colors[i],
                borderColor: colors[i],
                data: data.usages,
            };
        });
        this._setChartOptions();
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
                    scaleLabel: {
                        display: true,
                        labelString: this.currency,
                    },
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
