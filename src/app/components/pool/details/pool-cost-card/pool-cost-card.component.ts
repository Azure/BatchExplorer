import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { QuickRange, QuickRanges, TimeRange } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount } from "app/models";
import { BatchAccountService, Theme, ThemeService } from "app/services";
import {
    UsageDetailsUnsupportedSubscription,
} from "app/services/azure-consumption";
import { AzureCostManagementService, BatchPoolCost } from "app/services/azure-cost-management";
import { BehaviorSubject, Subject, combineLatest, of } from "rxjs";
import { catchError, filter, startWith, switchMap, takeUntil } from "rxjs/operators";

import "./pool-cost-card.scss";

@Component({
    selector: "bl-pool-cost-card",
    templateUrl: "pool-cost-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolCostCardComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public poolId: string;

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

    private _poolId = new BehaviorSubject<string | null>(null);
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
            switchMap(([timeRange, _]: [TimeRange, ArmBatchAccount]) => {
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

        combineLatest(obs, this._poolId, this.themeService.currentTheme).pipe(
            takeUntil(this._destroy),
        ).subscribe({
            next: ([accountCost, poolId, theme]) => {
                if (accountCost) {
                    this.unsupportedSubscription = false;
                    this._computeDataSets(accountCost.currency, poolId, accountCost.pools[poolId], theme);
                }
            },
        });
        this._setChartOptions();
    }

    public ngOnChanges(changes) {
        if (changes.poolId) {
            this._poolId.next(this.poolId);
        }
    }
    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    private _updateUsages() {
        this.unsupportedSubscription = false;
        this.changeDetector.markForCheck();
    }

    private _computeDataSets(currency: string, poolId: string, poolCost: BatchPoolCost | null, theme: Theme) {
        if (!poolCost) {
            this.total = "0";
            this.datasets = [];
            return;
        }
        this.currency = currency;
        this.total = poolCost.totalForPeriod.toFixed(2);

        const color = theme.chartColors.get(2);
        this.datasets = [{
            label: poolId,
            backgroundColor: color,
            borderColor: color,
            data: poolCost ? poolCost.costs.map((x) => {
                return { x: x.date, y: x.preTaxCost };
            }) : [],
        }];
        this._setChartOptions();
        this.changeDetector.markForCheck();
    }

    private _setChartOptions() {
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false,
            },
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
                    display: false,
                    distribution: "linear",
                    position: "bottom",
                    time: {
                        unit: "day",
                        unitStepSize: 1,
                        min: this.timeRange.value.start.toISOString(),
                        max: this.timeRange.value.end.toISOString(),
                    },
                }],
            },
        };
        this.changeDetector.markForCheck();
    }
}
