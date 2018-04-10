import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { FilterBuilder } from "@batch-flask/core";
import { AccountResource, BatchQuotas, JobState, Pool } from "app/models";
import { List } from "immutable";
import { AccountService } from "./account.service";
import { ApplicationService } from "./application.service";
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
    public usage: Observable<BatchQuotas>;
    private readonly _usage = new BehaviorSubject(new BatchQuotas());

    private vmSizeCores: StringMap<number>;
    private _subs: Subscription[] = [];

    constructor(
        private accountService: AccountService,
        private computeService: ComputeService,
        private applicationService: ApplicationService,
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
        this.usage = this._usage.asObservable();

        this.updateUsages();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public refresh() {
        return Observable.forkJoin(this.accountService.refresh(), this.updateUsages());
    }

    public updateUsages() {
        return Observable.forkJoin(
            this.updatePoolUsage(),
            this.updateJobUsage(),
            this.updateApplicationUsage());
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
            filter: FilterBuilder.prop("state").eq(JobState.active).toOData(),
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

    private _computeQuotas(account: AccountResource): Observable<BatchQuotas> {
        if (account.isBatchManaged) {
            return Observable.of(new BatchQuotas({
                dedicatedCores: account.properties.dedicatedCoreQuota,
                lowpriCores: account.properties.lowPriorityCoreQuota,
                pools: account.properties.poolQuota,
                jobs: account.properties.activeJobAndJobScheduleQuota,
                applications: 20,
            }));
        } else {
            return this.computeService.getCoreQuota().map((dedicatedCoreQuota) => {
                return new BatchQuotas({
                    dedicatedCores: dedicatedCoreQuota,
                    lowpriCores: null,
                    pools: account.properties.poolQuota,
                    jobs: account.properties.activeJobAndJobScheduleQuota,
                    applications: 20,
                });
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
