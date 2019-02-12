import { Injectable, OnDestroy } from "@angular/core";
import { FilterBuilder } from "@batch-flask/core";
import { ArmBatchAccount, JobState, Pool } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subject, combineLatest, forkJoin, of } from "rxjs";
import { filter, map, publishReplay, refCount, switchMap, takeUntil } from "rxjs/operators";
import { BatchApplicationService } from "./azure-batch/batch-application/batch-application.service";
import { JobService } from "./azure-batch/job";
import { PoolService } from "./azure-batch/pool";
import { BatchAccountService } from "./batch-account";
import { VmSizeService } from "./compute";
import { ComputeService } from "./compute.service";

export interface PoolQuotas {
    pools: number;
    dedicatedCores: number;
    lowpriCores: number;
}

export interface ApplicationQuotas {
    applications: number;
}

export interface JobQuotas {
    jobs: number;
}

export interface BatchQuotas extends PoolQuotas, ApplicationQuotas, JobQuotas {

}

export const EMPTY_QUOTAS: Readonly<BatchQuotas> = Object.freeze({
    pools: 0,
    dedicatedCores: 0,
    lowpriCores: 0,
    applications: 0,
    jobs: 0,
});

/**
 * Service grouping all quotas needed
 */
@Injectable({ providedIn: "root" })
export class QuotaService implements OnDestroy {
    public quotas: Observable<BatchQuotas>;
    public usage: Observable<BatchQuotas>;
    private readonly _applicationUsage = new BehaviorSubject<ApplicationQuotas>({ applications: 0 });
    private readonly _jobUsage = new BehaviorSubject<JobQuotas>({ jobs: 0 });

    private _destroy = new Subject();

    constructor(
        private accountService: BatchAccountService,
        private computeService: ComputeService,
        private applicationService: BatchApplicationService,
        private poolService: PoolService,
        private jobService: JobService,
        private vmSizeService: VmSizeService) {

        accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            switchMap(() => this.updateUsages()),
        ).subscribe();

        this.quotas = this.accountService.currentAccount.pipe(
            filter(x => x instanceof ArmBatchAccount),
            switchMap((account: ArmBatchAccount) => {
                return this._computeQuotas(account);
            }),
            publishReplay(1),
            refCount(),
        );

        this.usage = combineLatest(
            this._getPoolUsage(),
            this._jobUsage,
            this._applicationUsage,
        ).pipe(
            map(([poolUsage, jobUsage, applicationUsage]): BatchQuotas => {
                return { ...poolUsage, ...jobUsage, ...applicationUsage };
            }),
            publishReplay(1),
            refCount(),
        );

        this.updateUsages().subscribe();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public refresh() {
        return forkJoin(this.accountService.refresh(), this.updateUsages());
    }

    public updateUsages() {
        return forkJoin(
            this.poolService.refresh(),
            this.updateJobUsage(),
            this.updateApplicationUsage());
    }

    public updateJobUsage() {
        const obs = this.jobService.listAll({
            filter: FilterBuilder.prop("state").eq(JobState.active),
            select: "id",
        });
        obs.subscribe((jobs) => {
            this._jobUsage.next({
                jobs: jobs.size,
            });
        });
        return obs;
    }

    public updateApplicationUsage() {
        const obs = this.applicationService.listAll({
            select: "id",
        });
        obs.subscribe((applications) => {
            this._applicationUsage.next({
                applications: applications.size,
            });
        });
        return obs;
    }

    private _getPoolUsage(): Observable<PoolQuotas> {

        const vmSizeObs = combineLatest(
            this.vmSizeService.virtualMachineSizes,
            this.vmSizeService.cloudServiceSizes,
        ).pipe(
            takeUntil(this._destroy),
            map(([vmSizes, csSizes]) => {
                const cores = { ...this.vmSizeService.additionalVmSizeCores };

                if (csSizes) {
                    csSizes.forEach(vmSize => cores[vmSize.id] = vmSize.numberOfCores);
                }

                if (vmSizes) {
                    vmSizes.forEach(vmSize => cores[vmSize.id] = vmSize.numberOfCores);
                }
                return cores;
            }),
        );

        return combineLatest(
            this.poolService.pools,
            vmSizeObs,
        ).pipe(
            map(([pools, cores]) => {
                const { dedicatedCores, lowpriCores } = this._getCoreUsages(pools, cores);
                return {
                    pools: pools.size,
                    dedicatedCores,
                    lowpriCores,
                };
            }),
        );
    }

    private _computeQuotas(account: ArmBatchAccount): Observable<BatchQuotas> {
        if (account.isBatchManaged) {
            return of({
                dedicatedCores: account.properties.dedicatedCoreQuota,
                lowpriCores: account.properties.lowPriorityCoreQuota,
                pools: account.properties.poolQuota,
                jobs: account.properties.activeJobAndJobScheduleQuota,
                applications: 20,
            });
        } else {
            return this.computeService.getCoreQuota().pipe(map((dedicatedCoreQuota) => {
                return {
                    dedicatedCores: dedicatedCoreQuota,
                    lowpriCores: null,
                    pools: account.properties.poolQuota,
                    jobs: account.properties.activeJobAndJobScheduleQuota,
                    applications: 20,
                };
            }));
        }
    }

    private _getCoreUsages(pools: List<Pool>, cores: StringMap<number>) {
        let dedicatedCores = 0;
        let lowpriCores = 0;
        if (!pools || pools.size === 0) {
            return { dedicatedCores: 0, lowpriCores: 0 };
        }
        pools.forEach(pool => {
            if (pool && pool.vmSize) {
                const key = pool.vmSize.toLowerCase();
                if (cores[key]) {
                    dedicatedCores += (cores[key] * pool.currentDedicatedNodes);
                    lowpriCores += (cores[key] * pool.currentLowPriorityNodes);
                }
            }
        });

        return { dedicatedCores, lowpriCores };
    }
}
