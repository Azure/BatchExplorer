import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { BatchQuotas, BatchQuotasAttributes } from "app/models";
import { QuotaService } from "app/services";

import "./inline-quota.scss";

type ProgressColorClass = "high-usage" | "medium-usage" | "low-usage";

@Component({
    selector: "bl-inline-quota",
    templateUrl: "inline-quota.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineQuotaComponent implements OnDestroy, OnInit {
    @Input() public set include(quotas: string | string[]) {
        this._include = Array.isArray(quotas) ? quotas : quotas.split(",") as any;
    }

    public bufferValue = 100;

    public quotas: BatchQuotas = new BatchQuotas();
    public use: BatchQuotas = new BatchQuotas();
    public loadingUse = true;
    public statues = [];

    private _include: Array<keyof (BatchQuotasAttributes)>;
    private _quotaSub: Subscription;

    constructor(private quotaService: QuotaService, private changeDetector: ChangeDetectorRef) {
        this._quotaSub = this.quotaService.quotas.subscribe((quotas) => {
            this.quotas = quotas;
            this._update();
        });
    }

    public ngOnInit() {
        this.quotaService.getUsage().subscribe((quota) => {
            this.loadingUse = false;
            this.use = quota;
            this._update();

        });
    }

    public ngOnDestroy(): void {
        this._quotaSub.unsubscribe();
    }

    public get mainStatus() {
        return this.statues.first();
    }

    /**
     * Defines usage progress bar color for pool usage, dedicated/lowPriority cores usage.
     * Use 3 different states (error, warn and success) to represent high usage, medium usage and low usage
     * @param percent
     */
    public getColorClass(percent: number): ProgressColorClass {
        if (percent <= 100 && percent >= 90) {
            return "high-usage";
        } else if (percent >= 50) {
            return "medium-usage";
        }
        return "low-usage";
    }

    private _update() {
        this.statues = this._include.map((name) => {
            const usage = this.use && this.use[name];
            const total = this.quotas && this.quotas[name];
            const percent = this._calculatePercentage(usage, total);

            return {
                name,
                usage,
                total,
                percent,
            };
        }).sort((a, b) => b.percent - a.percent);
        this.changeDetector.markForCheck();
    }

    /**
     * Calculate percentage of used pools, dedicated/lowPriority cores
     * @param used
     * @param total
     */
    private _calculatePercentage(used: number, total: number): number {
        if (used !== null && total !== null && total > 0) {
            return (used / total) * 100;
        }
        return 0;
    }

}
