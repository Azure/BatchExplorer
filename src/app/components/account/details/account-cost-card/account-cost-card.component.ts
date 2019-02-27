import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount } from "app/models";
import { BatchAccountService, Theme, ThemeService } from "app/services";
import {
    UsageDetailsUnsupportedSubscription,
} from "app/services/azure-consumption";
import { AzureCostEntry, AzureCostManagementService } from "app/services/azure-cost-management";
import { Subject, combineLatest, of } from "rxjs";
import { catchError, filter, switchMap, takeUntil } from "rxjs/operators";

import "./account-cost-card.scss";

@Component({
    selector: "bl-account-cost-card",
    templateUrl: "account-cost-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCostCardComponent implements OnInit, OnDestroy {

    public chartType = "bar";
    public datasets: Chart.ChartDataSets[] = [];
    public options: Chart.ChartOptions = {};
    public currency: string;
    public isArmBatchAccount: boolean;
    public unsupportedSubscription: boolean;
    public total: string;

    private _destroy = new Subject();

    constructor(
        private costService: AzureCostManagementService,
        private accountService: BatchAccountService,
        private themeService: ThemeService,
        private changeDetector: ChangeDetectorRef) {
    }

    public ngOnInit() {
        const obs = this.accountService.currentAccount.pipe(
            filter((account) => {
                this.isArmBatchAccount = account instanceof ArmBatchAccount;
                if (this.isArmBatchAccount) {
                    this._updateUsages();
                } else {
                    this.unsupportedSubscription = false;
                }
                this.changeDetector.markForCheck();
                return this.isArmBatchAccount;
            }),
            switchMap(() => {
                return this.costService.getCost().pipe(
                    catchError((error) => {
                        if (error instanceof UsageDetailsUnsupportedSubscription) {
                            this.unsupportedSubscription = true;
                            this.changeDetector.markForCheck();
                        } else {
                            log.error("Error retrieving cost", error);
                        }
                        return of(null);
                    }),
                );
            }),
        );

        combineLatest(obs, this.themeService.currentTheme).pipe(
            takeUntil(this._destroy),
        ).subscribe({
            next: ([usages, theme]) => {
                if (usages) {
                    this.unsupportedSubscription = false;
                    this._computeDataSets(usages, theme);
                }
            },
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
    }

    private _computeDataSets(usages: AzureCostEntry[], theme: Theme) {
        const groups: StringMap<{ meter: string, usages: StringMap<{ x: Date, y: number }> }> = {};

        if (usages.length > 0) {
            this.currency = usages.first().currency;
        }

        let total = 0;

        const days = new Set<string>();
        for (const usage of usages) {
            const meterId = usage.meter;

            if (!(meterId in groups)) {
                groups[meterId] = {
                    meter: usage.meter,
                    usages: {},
                };
            }
            const isoDate = usage.date.toISOString();
            days.add(isoDate);
            groups[meterId].usages[isoDate] = {
                x: usage.date,
                y: usage.preTaxCost,
            };
            total += usage.preTaxCost;
        }

        for (const { usages } of Object.values(groups)) {
            for (const day of days) {
                if (!(day in usages)) {
                    usages[day] = {
                        x: new Date(day),
                        y: 0,
                    };
                }
            }
        }
        this.total = total.toFixed(2);
        this.datasets = Object.values(groups).map((data, i) => {
            const color = theme.chartColors.get(i);
            return {
                label: data.meter,
                backgroundColor: color,
                borderColor: color,
                data: Object.values(data.usages).sortBy(x => x.x),
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
                    distribution: "linear",
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
