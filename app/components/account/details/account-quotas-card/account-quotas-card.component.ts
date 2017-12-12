import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { AccountResource, Pool } from "app/models";
import { ComputeService, PoolListParams, PoolService, VmSizeService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";

import { List } from "immutable";
import { Observable } from "rxjs/Observable";
import "./account-quotas-card.scss";

type ProgressColorClass = "high-usage" | "medium-usage" | "low-usage";

@Component({
    selector: "bl-account-quotas-card",
    templateUrl: "account-quotas-card.html",
})
export class AccountQuotasCardComponent implements OnChanges, OnDestroy {
    @Input() public account: AccountResource;
    public get bufferValue(): number {
        return 100;
    }
    public poolData: ListView<Pool, PoolListParams>;
    public vmSizeCores: StringMap<number>;

    private _usedPool: number = null;
    private _totalPoolQuota: number = null;

    private _dedicatedCoreLoadingStatus = LoadingStatus.Loading;
    private _usedDedicatedCore: number = null;
    private _dedicatedCoreQuota: number = null;

    private _lowPriorityCoreStatus = LoadingStatus.Loading;
    private _usedLowPrioirtyCore: number = null;
    private _lowPriorityCoreQuota: number = null;

    private _poolListViewSub: Subscription;
    private _vmSizeSub: Subscription;
    private _computeServiceSub: Subscription;

    constructor(private computeService: ComputeService,
                private poolService: PoolService,
                private vmSizeService: VmSizeService) {
        this.vmSizeCores = {...vmSizeService.additionalVmSizeCores};
        const vmSizeObs = Observable.merge(
            this.vmSizeService.virtualMachineSizes, this.vmSizeService.cloudServiceSizes);
        this._vmSizeSub = vmSizeObs.subscribe(vmSizes => {
            if (vmSizes) {
                vmSizes.forEach(vmSize => this.vmSizeCores[vmSize.id] = vmSize.numberOfCores);
            }
        });
    }

    public ngOnChanges(changes) {
        if (changes.account) {
            if (this.account.isBatchManaged) {
                this._dedicatedCoreQuota = this.account.properties.dedicatedCoreQuota;
                this._lowPriorityCoreQuota = this.account.properties.lowPriorityCoreQuota;
                this._listUsage();
            }

            if (this.isByosAccount(changes)) {
                if (this._computeServiceSub) {
                    this._computeServiceSub.unsubscribe();
                }
                this._computeServiceSub = this.computeService.getCoreQuota().subscribe((dedicatedCoreQuota) => {
                    if (this.isByosAccount(changes)) {
                        this._dedicatedCoreQuota = dedicatedCoreQuota;
                        this._lowPriorityCoreQuota = null;
                        this._listUsage(true);
                    }
                });
            }
        }
    }

    public ngOnDestroy(): void {
        if (this._poolListViewSub) {
            this._poolListViewSub.unsubscribe();
        }
        if (this._vmSizeSub) {
            this._vmSizeSub.unsubscribe();
        }
        if (this._computeServiceSub) {
            this._computeServiceSub.unsubscribe();
        }
    }

    /**
     * Get pool usage progress bar percent
     */
    public get poolUsagePercent() {
        return this._calculatePercentage(this._usedPool, this._totalPoolQuota);
    }

    /**
     * Get friendly message displayed for pools
     * Format: {{used}}/{{total}} ({{Percent}})
     */
    public get poolUsageStatus(): string {
        const used = this._usedPool;
        const total = this._totalPoolQuota;
        if (used !== null && total !== null) {
            return `${used}/${total} (${Math.floor(this.poolUsagePercent)}%)`;
        }
        return "N/A";
    }

    /**
     * Get dedicated cores usage progress bar percent
     */
    public get dedicatedCoresPercent() {
        return this._calculatePercentage(this._usedDedicatedCore, this._dedicatedCoreQuota);
    }

    /**
     * Get friendly message displayed for dedicated cores
     * Format: {{used}}/{{total}} ({{Percent}})
     */
    public get dedicatedCoreStatus(): string {
        switch (this._dedicatedCoreLoadingStatus) {
            case LoadingStatus.Loading:
                return "Loading.";
            case LoadingStatus.Ready:
                const used = this._usedDedicatedCore;
                const total = this._dedicatedCoreQuota;
                if (used !== null && total !== null) {
                    return `${used}/${total} (${Math.floor(this.dedicatedCoresPercent)}%)`;
                }
            case LoadingStatus.Error:
            default:
                return "N/A";
        }
    }

    /**
     * Get low priority cores usage progress bar percent
     */
    public get lowPriorityCoresPercent() {
        return this._calculatePercentage(this._usedLowPrioirtyCore, this._lowPriorityCoreQuota);
    }

    /**
     * Get friendly message displayed for low priority cores
     * Format: {{used}}/{{total}} ({{Percent}})
     */
    public get lowPriorityCoreStatus(): string {
        switch (this._lowPriorityCoreStatus) {
            case LoadingStatus.Loading:
                return "Loading.";
            case LoadingStatus.Ready:
                const used = this._usedLowPrioirtyCore;
                const total = this._lowPriorityCoreQuota;
                if (used !== null && total !== null) {
                    return `${used}/${total} (${Math.floor(this.lowPriorityCoresPercent)}%)`;
                }
            case LoadingStatus.Error:
            default:
                return "N/A";
        }
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
     * Fetch latest pool list and core usages
     */
    private _listUsage(isByos?: boolean) {
        this._dedicatedCoreLoadingStatus = LoadingStatus.Loading;
        this._lowPriorityCoreStatus = LoadingStatus.Loading;
        this.poolData = this.poolService.listView();
        this.poolData.fetchNext();
        if (this._poolListViewSub) {
            this._poolListViewSub.unsubscribe();
        }
        this._poolListViewSub = this.poolData.items.subscribe((pools) => {
            this._usedPool = pools.size;
            this._loadCoreUsages(pools);
            this._dedicatedCoreLoadingStatus = LoadingStatus.Ready;
            if (isByos) {
                this._lowPriorityCoreStatus = LoadingStatus.Error;
            } else {
                this._lowPriorityCoreStatus = LoadingStatus.Ready;
            }
        }, (error) => {
            this._dedicatedCoreLoadingStatus = LoadingStatus.Error;
            this._lowPriorityCoreStatus = LoadingStatus.Error;
        });
        this._totalPoolQuota = this.account.properties.poolQuota;
    }

    /**
     * Calculate pool dedicated cores and low priority core usage
     * @param pools
     */
    private _loadCoreUsages(pools: List<Pool>) {
        this._usedDedicatedCore = 0;
        this._usedLowPrioirtyCore = 0;
        if (!pools || pools.size === 0) {
            return;
        }
        pools.forEach(pool => {
            if (pool && pool.vmSize) {
                const key = pool.vmSize.toLowerCase();
                if (this.vmSizeCores[key]) {
                    this._usedDedicatedCore += (this.vmSizeCores[key] * pool.currentDedicatedNodes);
                    this._usedLowPrioirtyCore += (this.vmSizeCores[key] * pool.currentLowPriorityNodes);
                }
            }
        });
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

    private isByosAccount(changes) {
        return ComponentUtils.recordChangedId(changes.account) && !this.account.isBatchManaged;
    }
}
