import { Injectable, OnDestroy } from "@angular/core";
import { FilterBuilder } from "@batch-flask/core";
import { ArmBatchAccount, BatchQuotas, JobState, Pool } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subscription, forkJoin, merge, of } from "rxjs";
import { filter, flatMap, map, share, shareReplay, switchMap, take } from "rxjs/operators";
import { BatchApplicationService } from "./azure-batch/batch-application/batch-application.service";
import { JobService } from "./azure-batch/job";
import { PoolService } from "./azure-batch/pool";
import { BatchAccountService } from "./batch-account";
import { VmSizeService } from "./compute";
import { ComputeService } from "./compute.service";

/**
 * Service grouping all quotas needed
 */
@Injectable({providedIn: "root"})
export class QuotaService implements OnDestroy {
    public quotas: Observable<BatchQuotas>;
    public usage: Observable<BatchQuotas>;
    private readonly _usage = new BehaviorSubject(new BatchQuotas());

    private vmSizeCores: StringMap<number>;
    private _subs: Subscription[] = [];

    constructor(
        private accountService: BatchAccountService,
        private computeService: ComputeService,
        private applicationService: BatchApplicationService,
        private poolService: PoolService,
        private jobService: JobService,
        private vmSizeService: VmSizeService) {

        this.vmSizeCores = { ...vmSizeService.additionalVmSizeCores };
        const vmSizeObs = merge(
            this.vmSizeService.virtualMachineSizes, this.vmSizeService.cloudServiceSizes);
        this._subs.push(vmSizeObs.subscribe(vmSizes => {
            if (vmSizes) {
                vmSizes.forEach(vmSize => this.vmSizeCores[vmSize.id] = vmSize.numberOfCores);
            }
        }));
        this._subs.push(accountService.currentAccount.pipe(
            switchMap(() => this.updateUsages()),
        ).subscribe());

        this.quotas = this.accountService.currentAccount.pipe(
            filter(x => x instanceof ArmBatchAccount),
            flatMap((account: ArmBatchAccount) => {
                return this._computeQuotas(account);
            }),
            shareReplay(1),
        );
        this.usage = this._usage.asObservable();

        this.updateUsages().subscribe();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public refresh() {
        return forkJoin(this.accountService.refresh(), this.updateUsages());
    }

    public updateUsages() {
        const obs = this.accountService.currentAccount.pipe(
            take(1),
            switchMap((account) => {
                if (account instanceof ArmBatchAccount) {
                    return forkJoin(
                        this.updatePoolUsage(),
                        this.updateJobUsage(),
                        this.updateApplicationUsage());
                } else {
                    this._usage.next(new BatchQuotas({}));
                    return of(null);
                }
            }),
            share(),
        );
        obs.subscribe();
        return obs;
    }

    public updatePoolUsage() {
        const obs = this.poolService.listAll({
            select: "id,vmSize,currentDedicatedNodes,currentLowPriorityNodes",
        });
        obs.subscribe((pools) => {
            const { dedicatedCores, lowpriCores } = this._getCoreUsages(pools);
            this._usage.next(new BatchQuotas({
                ...this._getExistingQuota().toJS(),
                pools: pools.size,
                dedicatedCores,
                lowpriCores,
            }));
        });
        return obs;
    }

    public updateJobUsage() {
        const obs = this.jobService.listAll({
            filter: FilterBuilder.prop("state").eq(JobState.active),
            select: "id",
        });
        obs.subscribe((jobs) => {
            this._usage.next(new BatchQuotas({
                ...this._getExistingQuota().toJS(),
                jobs: jobs.size,
            }));
        });
        return obs;
    }

    public updateApplicationUsage() {
        const obs = this.applicationService.listAll({
            select: "id",
        });
        obs.subscribe((applications) => {
            this._usage.next(new BatchQuotas({
                ...this._getExistingQuota().toJS(),
                applications: applications.size,
            }));
        });
        return obs;
    }

    public resetUsage() {
        this._usage.next(new BatchQuotas());
    }

    private _getExistingQuota() {
        return this._usage.value || new BatchQuotas();
    }

    private _computeQuotas(account: ArmBatchAccount): Observable<BatchQuotas> {
        if (account.isBatchManaged) {
            return of(new BatchQuotas({
                dedicatedCores: account.properties.dedicatedCoreQuota,
                lowpriCores: account.properties.lowPriorityCoreQuota,
                pools: account.properties.poolQuota,
                jobs: account.properties.activeJobAndJobScheduleQuota,
                applications: 20,
            }));
        } else {
            return this.computeService.getCoreQuota().pipe(map((dedicatedCoreQuota) => {
                return new BatchQuotas({
                    dedicatedCores: dedicatedCoreQuota,
                    lowpriCores: null,
                    pools: account.properties.poolQuota,
                    jobs: account.properties.activeJobAndJobScheduleQuota,
                    applications: 20,
                });
            }));
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
