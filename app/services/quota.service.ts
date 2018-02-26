import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { AccountResource, BatchQuotas, Job, JobState, Pool } from "app/models";
import { AccountService } from "app/services";
import { FilterBuilder } from "app/utils/filter-builder";
import { List } from "immutable";
import { ComputeService } from "./compute.service";
import { JobService } from "./job-service";
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
        private jobService: JobService,
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

    public getUsage(include: { job?: boolean, pool?: boolean } = null): Observable<BatchQuotas> {
        include = include || { job: true, pool: true };
        let poolObs;
        let jobObs;
        if (include.pool) {
            poolObs = this.poolService.listAll({
                select: "id,vmSize,currentDedicatedNodes,currentLowPriorityNodes",
            });
        } else {
            poolObs = Observable.of(List([]));
        }
        if (include.job) {
            jobObs = this.jobService.listAll({
                filter: FilterBuilder.prop("state").eq(JobState.active).toOData(),
                select: "id",
            });
        } else {
            jobObs = Observable.of(List([]));
        }
        return Observable.forkJoin(poolObs, jobObs).map(([pools, jobs]: any) => {
            return this._extractUsage(pools, jobs);
        }).share();
    }

    private _extractUsage(pools: List<Pool>, jobs: List<Job>) {
        console.log("oools", this.poolService);
        const { dedicatedCores, lowpriCores } = this._getCoreUsages(pools);
        return new BatchQuotas({
            pools: pools.size,
            dedicatedCores,
            lowpriCores,
            jobs: jobs.size,
        });
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
            return { dedicatedCores: 0, lowpriCores: 0 };
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
