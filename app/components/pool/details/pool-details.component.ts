import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { Pool } from "app/models";
import { PoolDecorator } from "app/models/decorators";
import { PoolParams, PoolService, PricingService } from "app/services";
import { EntityView } from "app/services/core/data";
import { NumberUtils } from "app/utils";
import { SidebarManager } from "../../base/sidebar";
import { DeletePoolDialogComponent, PoolCreateBasicDialogComponent, PoolResizeDialogComponent } from "../action";

import "./pool-details.scss";

@Component({
    selector: "bl-pool-details",
    templateUrl: "pool-details.html",
})
export class PoolDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        let label = tab ? `Pool - ${tab}` : "Pool";
        return {
            name: id,
            label,
            icon: "database",
        };
    }

    public poolId: string;
    public poolDecorator: PoolDecorator;
    public set pool(pool: Pool) {
        this._pool = pool;
        this.poolDecorator = pool && new PoolDecorator(pool);
    }
    public get pool() { return this._pool; }
    public data: EntityView<Pool, PoolParams>;
    public estimatedCost = "-";

    private _paramsSubscriber: Subscription;
    private _pool: Pool;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private sidebarManager: SidebarManager,
        private pricingService: PricingService,
        private poolService: PoolService) {

        this.data = this.poolService.view();
        this.data.item.subscribe((pool) => {
            this.pool = pool;
            this._updatePrice();
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
        this.data.dispose();
    }

    public get filterPlaceholderText() {
        return "Filter by node id";
    }

    @autobind()
    public refreshPool() {
        return this.data.refresh();
    }

    @autobind()
    public addJob() {
        const createRef = this.sidebarManager.open("add-basic-job", JobCreateBasicDialogComponent);
        createRef.component.preSelectPool(this.pool.id);
    }

    @autobind()
    public deletePool() {
        let config = new MatDialogConfig();
        const dialogRef = this.dialog.open(DeletePoolDialogComponent, config);
        dialogRef.componentInstance.poolId = this.poolId;
    }

    @autobind()
    public clonePool() {
        const ref = this.sidebarManager.open("add-basic-pool", PoolCreateBasicDialogComponent);
        ref.component.setValueFromEntity(this.pool);
    }

    @autobind()
    public resizePool() {
        const sidebarRef = this.sidebarManager.open(`resize-pool-${this.pool.id}`, PoolResizeDialogComponent);
        sidebarRef.component.pool = this.pool;
        this.sidebarManager.onClosed.subscribe(() => {
            this.refreshPool();
        });
    }

    @autobind()
    public updateTags(newTags: List<string>) {
        return this.poolService.updateTags(this.pool, newTags).flatMap(() => {
            return this.data.refresh();
        });
    }

    private _updatePrice() {
        if (!this.pool) {
            this.estimatedCost = "-";
            return;
        }
        this.pricingService.computePoolPrice(this.pool).subscribe((cost) => {
            if (!cost) {
                this.estimatedCost = "-";
            } else {
                this.estimatedCost = `${cost.unit} ${NumberUtils.pretty(cost.total)}`;
            }
        });
    }
}
