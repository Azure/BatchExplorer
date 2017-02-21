import { Component, Input,  OnDestroy, OnInit } from "@angular/core";

import { Pool } from "app/models";
import { PoolDecorator } from "app/models/decorators";

// todo: put this template into a separate template file.
// todo: ngFor to list properties. create a property collection below and bid it to the UI.
// todo: directives for some of the more interesting property fields, like state that will show an icon.
// todo: link properties, copy field properties.
// todo: use moment for date formatting.
// todo: pull in timespan and date formatting code from the portal.

@Component({
    selector: "bl-pool-properties",
    templateUrl: "pool-properties.html",
})
export class PoolPropertiesComponent implements OnInit, /*OnChanges,*/ OnDestroy {
    @Input()
    public set pool(value: Pool) {
        this._pool = value;
        this.decorator = new PoolDecorator(this._pool);
    }
    public get pool() { return this._pool; }

    public decorator: PoolDecorator;

    private _pool: Pool;

    // TODO: Expose a 'status' input which can be used to control the loading
    // TODO: state of the component

    public ngOnInit() {
        /* tab show */
    }

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

    public ngOnDestroy() {
        /* tab hide */
    }
}
