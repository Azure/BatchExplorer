import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import * as Moment from "moment";
import { Subscription } from "rxjs";

import { SidebarManager } from "../../base/sidebar";
import { DeletePoolDialogComponent, PoolResizeDialogComponent } from "../action";
import { PoolCreateBasicDialogComponent } from "../action";
import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { Pool } from "app/models";
import { PoolParams, PoolService } from "app/services";
import { RxEntityProxy } from "app/services/core";

@Component({
    selector: "bex-pool-details",
    templateUrl: "./pool-details.html",
})
export class PoolDetailsComponent implements OnInit, OnDestroy {
    public poolId: string;
    public pool: Pool;
    public data: RxEntityProxy<PoolParams, Pool>;

    private _paramsSubscriber: Subscription;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private dialog: MdDialog,
        private sidebarManager: SidebarManager,
        private viewContainerRef: ViewContainerRef,
        private poolService: PoolService) {

        this.data = this.poolService.get(null, {});
        this.data.item.subscribe((pool) => {
            this.pool = pool;
        });

        this.data.deleted.subscribe((key) => {
            if (key === this.poolId) {
                this.router.navigate(["/pools"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.poolId = params["id"];
            this.data.params = { id: this.poolId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    @autobind()
    public refreshPool() {
        return this.data.refresh();
    }

    public addJob() {
        const createRef = this.sidebarManager.open("add-basic-job", JobCreateBasicDialogComponent);
        createRef.component.preSelectPool(this.pool.id);
    }

    public deletePool() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(DeletePoolDialogComponent, config);
        dialogRef.componentInstance.poolId = this.poolId;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refreshPool();
        });
    }

    public clonePool() {
        const ref = this.sidebarManager.open("add-basic-pool", PoolCreateBasicDialogComponent);
        ref.component.setValue(this.pool);
    }

    public resizePool() {
        const sidebarRef = this.sidebarManager.open("resize-pool", PoolResizeDialogComponent);
        sidebarRef.component.pool = this.pool;
        this.sidebarManager.onClosed.subscribe(() => {
            this.refreshPool();
        });
    }

    // TODO: Move all of these to pool decorator
    public get poolOs(): string {
        if (this.pool.cloudServiceConfiguration) {
            let osName: string;
            let osFamily = this.pool.cloudServiceConfiguration.osFamily;

            if (osFamily === 2) {
                osName = "Windows Server 2008 R2 SP1";
            } else if (osFamily === 3) {
                osName = "Windows Server 2012";
            } else {
                osName = "Windows Server 2012 R2";
            }

            return osName;
        }

        if (this.pool.virtualMachineConfiguration.imageReference.publisher ===
            "MicrosoftWindowsServer") {
            let osName = "Windows Server";
            osName += this.pool.virtualMachineConfiguration.imageReference.sku;

            return osName;
        }

        return "Linux";
    }

    public get poolOsIcon(): string {
        if (this.poolOs.includes("Windows")) {
            return "windows";
        }

        return "linux";
    }

    public get lastResize(): string {
        return Moment(this.pool.allocationStateTransitionTime).fromNow();
    }

    @autobind()
    public fixStopResizeError() {
        const obs = this.poolService.resize(this.poolId, this.pool.targetDedicated);
        obs.subscribe(() => {
            this.refreshPool();
        });

        return obs;
    }
}
