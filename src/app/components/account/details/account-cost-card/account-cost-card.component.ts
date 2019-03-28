import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { QuickRange, QuickRanges, TimeRange } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount } from "app/models";
import { BatchAccountService, Theme, ThemeService } from "app/services";
import {
    UsageDetailsUnsupportedSubscription,
} from "app/services/azure-consumption";
import { AzureCostManagementService, BatchAccountCost } from "app/services/azure-cost-management";
import { Subject, combineLatest, of } from "rxjs";
import { catchError, filter, startWith, switchMap, takeUntil } from "rxjs/operators";

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

    public quickRanges: QuickRange[] = [
        QuickRanges.thisMonthRange,
        QuickRanges.lastMonthRange,
        QuickRanges.thisQuarterRange,
        QuickRanges.thisYearRange,
    ];

    public timeRange = new FormControl<TimeRange>(QuickRanges.thisMonthRange);

    private _destroy = new Subject();

    constructor(
        private costService: AzureCostManagementService,
        private accountService: BatchAccountService,
        private themeService: ThemeService,
        private changeDetector: ChangeDetectorRef) {
    }

    public ngOnInit() {
        const currentAccountObs = this.accountService.currentAccount.pipe(
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
        );
        const obs = combineLatest(
            this.timeRange.valueChanges.pipe(startWith(this.timeRange.value)),
            currentAccountObs,
        ).pipe(
            switchMap(([timeRange, _]) => {
                return this.costService.getCost(timeRange).pipe(
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

    private _computeDataSets(accountCost: BatchAccountCost, theme: Theme) {
        this.currency = accountCost.currency;
        this.total = accountCost.totalForPeriod.toFixed(2);

        this.datasets = Object.entries(accountCost.pools).map(([poolId, poolCost], i) => {
            const color = theme.chartColors.get(i);
            return {
                label: poolId,
                backgroundColor: color,
                borderColor: color,
                data: poolCost.costs.map((x) => {
                    return { x: x.date, y: x.preTaxCost };
                }),
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
                        min: this.timeRange.value.start.toISOString(),
                        max: this.timeRange.value.end.toISOString(),
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
