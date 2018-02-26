import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { AccountResource, BatchQuotas, Pool } from "app/models";
import { AccountService } from "app/services";
import { List } from "immutable";
import { ComputeService } from "./compute.service";
import { PoolService } from "./pool.service";
import { VmSizeService } from "./vm-size.service";

/**
 * Service grouping all quotas needed
 */
@Injectable()
export class QuotaService implements OnDestroy {
    public quotas: Observable<BatchQuotas>;

    private vmSizeCores: StringMap<number>;
    private _subs: Subscription[] = [];

    constructor(
        private accountService: AccountService,
        private computeService: ComputeService,
        private poolService: PoolService,
        private vmSizeService: VmSizeService) {

        this.vmSizeCores = { ...vmSizeService.additionalVmSizeCores };
        const vmSizeObs = Observable.merge(
            this.vmSizeService.virtualMachineSizes, this.vmSizeService.cloudServiceSizes);
        this._subs.push(vmSizeObs.subscribe(vmSizes => {
            if (vmSizes) {
                vmSizes.forEach(vmSize => this.vmSizeCores[vmSize.id] = vmSize.numberOfCores);
            }
        }));

        this.quotas = this.accountService.currentAccount.flatMap((account) => {
            return this._computeQuotas(account);
        }).shareReplay(1);
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public getUsage(): Observable<BatchQuotas> {
        return this.poolService.listAll().map((pools) => {
            const { dedicatedCores, lowpriCores } = this._getCoreUsages(pools);
            return new BatchQuotas({
                pools: pools.size,
                dedicatedCores,
                lowpriCores,
                jobs: 0,
            });
        }).share();
    }

    private _computeQuotas(account: AccountResource): Observable<BatchQuotas> {
        if (account.isBatchManaged) {
            return Observable.of(new BatchQuotas({
                dedicatedCores: account.properties.dedicatedCoreQuota,
                lowpriCores: account.properties.lowPriorityCoreQuota,
                pools: account.properties.poolQuota,
                jobs: account.properties.activeJobAndJobScheduleQuota,
            }));
        } else {
            this.computeService.getCoreQuota().map((dedicatedCoreQuota) => {
                return Observable.of(new BatchQuotas({
                    dedicatedCores: dedicatedCoreQuota,
                    lowpriCores: null,
                    pools: account.properties.poolQuota,
                    jobs: account.properties.activeJobAndJobScheduleQuota,
                }));
            });
        }
    }

    private _getCoreUsages(pools: List<Pool>) {
        let dedicatedCores = 0;
        let lowpriCores = 0;
        if (!pools || pools.size === 0) {
            return;
        }
        pools.forEach(pool => {
            if (pool && pool.vmSize) {
                const key = pool.vmSize.toLowerCase();
                if (this.vmSizeCores[key]) {
                    dedicatedCores += (this.vmSizeCores[key] * pool.currentDedicatedNodes);
                    lowpriCores += (this.vmSizeCores[key] * pool.currentLowPriorityNodes);
                }
            }
        });

        return { dedicatedCores, lowpriCores };
    }
}
