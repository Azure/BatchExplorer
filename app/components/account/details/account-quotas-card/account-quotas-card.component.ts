import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { AccountResource, BatchQuotas, BatchQuotasAttributes } from "app/models";
import { QuotaService } from "app/services";

import "./account-quotas-card.scss";

type ProgressColorClass = "high-usage" | "medium-usage" | "low-usage";

@Component({
    selector: "bl-account-quotas-card",
    templateUrl: "account-quotas-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountQuotasCardComponent implements OnDestroy, OnInit {
    @Input() public account: AccountResource;

    public get bufferValue(): number {
        return 100;
    }
    public quotas: BatchQuotas = new BatchQuotas();
    public use: BatchQuotas = new BatchQuotas();
    public loadingUse = true;

    private _quotaSub: Subscription;

    constructor(private quotaService: QuotaService, private changeDetector: ChangeDetectorRef) {
        this._quotaSub = this.quotaService.quotas.subscribe((quotas) => {
            this.quotas = quotas;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.quotaService.getUsage().subscribe((quota) => {
            this.loadingUse = false;
            this.use = quota;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy(): void {
        this._quotaSub.unsubscribe();
    }

    /**
     * Get pool usage progress bar percent
     */
    public get poolUsagePercent() {
        return this._calculatePercentage(this.use.pools, this.quotas.pools);
    }

    /**
     * Get friendly message displayed for pools
     * Format: {{used}}/{{total}} ({{Percent}})
     */
    public get poolStatus(): string {
        return this._prettyUsage("pools");
    }

    public get jobStatus(): string {
        return this._prettyUsage("jobs");
    }

    public get dedicatedCoresStatus(): string {
        return this._prettyUsage("dedicatedCores");
    }

    public get lowPriCoresStatus(): string {
        return this._prettyUsage("lowpriCores");
    }

    /**
     * Get dedicated cores usage progress bar percent
     */
    public get dedicatedCoresPercent() {
        return this._calculatePercentage(this.use.dedicatedCores, this.quotas.dedicatedCores);
    }

    /**
     * Get low priority cores usage progress bar percent
     */
    public get lowPriorityCoresPercent() {
        return this._calculatePercentage(this.use.lowpriCores, this.quotas.lowpriCores);
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

    private _prettyUsage(name: keyof (BatchQuotasAttributes)) {
        const used = this.use && this.use[name];
        const total = this.quotas && this.quotas[name];
        if (used !== null && total !== null) {
            return `${used}/${total} (${Math.floor(this._calculatePercentage(used, total))}%)`;
        }
        return "N/A";
    }
}
