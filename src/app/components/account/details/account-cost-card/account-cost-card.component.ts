import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { QuickRange, TimeRange } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount } from "app/models";
import { BatchAccountService, Theme, ThemeService } from "app/services";
import {
    UsageDetailsUnsupportedSubscription,
} from "app/services/azure-consumption";
import { AzureCostManagementService, BatchAccountCost } from "app/services/azure-cost-management";
import { DateTime } from "luxon";
import { Subject, combineLatest, of } from "rxjs";
import { catchError, filter, startWith, switchMap, takeUntil } from "rxjs/operators";

import "./account-cost-card.scss";

const today = DateTime.local();

const thisMonthRange = new QuickRange({
    label: "This month",
    start: today.startOf("month").toJSDate(),
    end: today.endOf("month").toJSDate(),
});

const lastMonthRange = new QuickRange({
    label: "Last month",
    start: today.minus({ month: 1 }).startOf("month").toJSDate(),
    end: today.minus({ month: 1 }).endOf("month").toJSDate(),
});

const thisQuarterRange = new QuickRange({
    label: "This quarter",
    start: today.startOf("quarter").toJSDate(),
    end: today.endOf("quarter").toJSDate(),
});

const thisYearRange = new QuickRange({
    label: "This year",
    start: today.startOf("year").toJSDate(),
    end: today.endOf("year").toJSDate(),
});

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
        thisMonthRange,
        lastMonthRange,
        thisQuarterRange,
        thisYearRange,
    ];

    public timeRange = new FormControl<TimeRange>(thisMonthRange);

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

    private _computeDataSets(usages: BatchAccountCost, theme: Theme) {
        if (Object.keys(usages).length > 0) {
            const arr = Object.values(usages).first();
            if (arr.length > 0) {
                this.currency = arr.first().currency;
            }
        }

        let total = 0;

        for (const usagesPerPool of Object.values(usages)) {
            for (const usage of usagesPerPool) {
                total += usage.preTaxCost;
            }
        }

        this.total = total.toFixed(2);
        this.datasets = Object.entries(usages).map(([poolId, usagesPerPool], i) => {
            const color = theme.chartColors.get(i);
            return {
                label: poolId,
                backgroundColor: color,
                borderColor: color,
                data: Object.values(usagesPerPool).map((x) => {
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
