import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnChanges, OnDestroy,
} from "@angular/core";
import { ElectronShell } from "@batch-flask/electron";
import { Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { BatchQuotas, BatchQuotasAttributes } from "app/models";
import { QuotaService } from "app/services";
import { Constants } from "common";
import "./inline-quota.scss";

const labels = {
    pools: "Pools quota",
    jobs: "Jobs quota",
    dedicatedCores: "Dedicated cores quota",
    lowpriCores: "LowPri cores quota",
    applications: "Applications quota",
};

@Component({
    selector: "bl-inline-quota",
    templateUrl: "inline-quota.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineQuotaComponent implements OnChanges, OnDestroy {
    @Input() public set include(quotas: string | string[]) {
        this._include = Array.isArray(quotas) ? quotas : quotas.split(",") as any;
    }

    public bufferValue = 100;

    public quotas: BatchQuotas = new BatchQuotas();
    public use: BatchQuotas = new BatchQuotas();
    public loadingUse = true;
    public statuses = [];
    public expanded: boolean = false;

    private _include: Array<keyof (BatchQuotasAttributes)> = [];
    private _quotaSub: Subscription;
    private _usageSub: Subscription;

    constructor(
        private quotaService: QuotaService,
        private changeDetector: ChangeDetectorRef,
        private contextMenuService: ContextMenuService,
        private shell: ElectronShell) {
        this._quotaSub = this.quotaService.quotas.subscribe((quotas) => {
            this.quotas = quotas;
            this._update();
        });

        this._usageSub = this.quotaService.usage.subscribe((quota) => {
            this.loadingUse = false;
            this.use = quota;
            this._update();
        });
    }

    public ngOnChanges(changes) {
        if (changes.include) {
            this._update();
        }
    }

    public ngOnDestroy(): void {
        this._quotaSub.unsubscribe();
        this._usageSub.unsubscribe();
    }

    public get mainStatus() {
        return this.statuses.first();
    }

    public get title() {
        return this.statuses.map(x => {
            return `${x.label.padEnd(20)}: ${x.use}/${x.quota}(${x.percent}%)`;
        }).join("\n");
    }

    @HostListener("click")
    public toggleExpanded() {
        this.expanded = !this.expanded;
        this.changeDetector.markForCheck();
    }

    @HostListener("contextmenu")
    public showContextMenu() {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Refresh quotas", () => this.quotaService.refresh()),
            new ContextMenuItem("Request quota increase", () => this._gotoQuotaRequest()),
        ]));
    }

    public trackStatus(index, status) {
        return status.label;
    }

    private _gotoQuotaRequest() {
        this.shell.openExternal(Constants.ExternalLinks.supportRequest);
    }

    private _update() {
        this.statuses = this._include.map((name) => {
            const use = this.use && this.use[name];
            const quota = this.quotas && this.quotas[name];
            const percent = this._calculatePercentage(use, quota);

            return {
                label: labels[name],
                use,
                quota,
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
