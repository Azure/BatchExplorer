import { Component, Input } from "@angular/core";

import { Pool } from "app/models";
import { PoolDecorator } from "app/models/decorators";

@Component({
    selector: "bl-pool-configuration",
    templateUrl: "pool-configuration.html",
})
export class PoolConfigurationComponent {
    @Input()
    public set pool(value: Pool) {
        this._pool = value;
        this.decorator = new PoolDecorator(this._pool);
    }
    public get pool() { return this._pool; }

    public decorator: PoolDecorator;

    private _pool: Pool;

    // /* @input parameter change */
    // public ngOnChanges() {
    //     if (this.poolId) {
    //         this.loading = true;
    //         this.jobService.get(this.poolId).subscribe(
    //             (job: Pool) => {
    //                 this.job = job;
    //                 this.constraints = job.constraints || {};
    //                 this.executionInfo = job.executionInfo || {};
    //                 this.jobManagerTask = job.jobManagerTask || {};
    //                 this.jobPreparationTask = job.jobPreparationTask || {};
    //                 this.jobReleaseTask = job.jobReleaseTask || {};
    //                 this.poolInfo = job.poolInfo || {};
    //                 this.loading = false;
    //             }
    //         );
    //     }
    // }
}
