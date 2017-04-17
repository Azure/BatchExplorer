import { Component, OnDestroy, OnInit, ViewContainerRef, ChangeDetectionStrategy } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import * as Moment from "moment";
import { Subscription } from "rxjs";

import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { Pool } from "app/models";
import { PoolParams, PoolService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { SidebarManager } from "../../base/sidebar";
import { DeletePoolDialogComponent, PoolResizeDialogComponent } from "../action";
import { PoolCreateBasicDialogComponent } from "../action";

@Component({
    selector: "bl-pool-details",
    templateUrl: "pool-details.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        let label = tab ? `Pool - ${tab}` : "Pool";
        return {
            name: id,
            label,
        };
    }

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

    public get filterPlaceholderText() {
        return "Filter by node id";
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
    }

    public clonePool() {
        const ref = this.sidebarManager.open("add-basic-pool", PoolCreateBasicDialogComponent);
        ref.component.setValueFromEntity(this.pool);
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
            } else if (osFamily === 4) {
                osName = "Windows Server 2012 R2";
            } else {
                osName = "Windows Server 2016";
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

    public get nodesTooltipMessage() {
        if (this.pool.resizeError) {
            return "There was a resize error";
        } else if (this.pool.currentDedicated !== this.pool.targetDedicated) {
            return `Pool is resizing from ${this.pool.currentDedicated} to ${this.pool.targetDedicated} nodes`;
        } else {
            return `Pool has ${this.pool.currentDedicated} nodes`;
        }
    }

    public get lastResize(): string {
        return Moment(this.pool.allocationStateTransitionTime).fromNow();
    }

    @autobind()
    public updateTags(newTags: List<string>) {
        return this.poolService.updateTags(this.pool, newTags).flatMap(() => {
            return this.data.refresh();
        });
    }
}
