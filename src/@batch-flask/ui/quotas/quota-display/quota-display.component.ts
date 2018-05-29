import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges } from "@angular/core";

import "./quota-display.scss";

type ProgressColorClass = "high-usage" | "medium-usage" | "low-usage";

export enum QuotaDisplayType {
    normal = "normal",
    compact = "compact",
}

@Component({
    selector: "bl-quota-display",
    templateUrl: "quota-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotaDisplayComponent implements OnChanges {

    @Input() public label: string;
    @Input() public use: number = null;
    @Input() public quota: number = null;
    @HostBinding("attr.type")
    @Input() public type: QuotaDisplayType = QuotaDisplayType.normal;

    public percent: number;

    public ngOnChanges(changes) {
        if (changes.use || changes.quota) {
            this.percent = this._calculatePercentage();
        }
    }

    /**
     * Defines usage progress bar color for pool usage, dedicated/lowPriority cores usage.
     * Use 3 different states (error, warn and success) to represent high usage, medium usage and low usage
     * @param percent
     */
    public get colorClass(): ProgressColorClass {
        const percent = this.percent;
        if (percent <= 100 && percent >= 90) {
            return "high-usage";
        } else if (percent >= 50) {
            return "medium-usage";
        }
        return "low-usage";
    }

    public get status() {
        if (this.quota === null) {
            return "N/A";
        }
        if (this.use === null) {
            return this.quota;
        }
        return `${this.use}/${this.quota} (${Math.floor(this.percent)}%)`;
    }

    /**
     * Calculate percentage of used pools, dedicated/lowPriority cores
     * @param used
     * @param total
     */
    private _calculatePercentage(): number {
        const use = this.use;
        const quota = this.quota;
        if (use !== null && quota !== null && quota > 0) {
            return (use / quota) * 100;
        }
        return 0;
    }

}
