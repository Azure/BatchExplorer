import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Pool } from "app/models";
import { PoolDecorator } from "app/models/decorators";
import { BatchLabsService, PoolParams, PoolService, PricingService } from "app/services";
import { EntityView } from "app/services/core/data";
import { NumberUtils } from "app/utils";
import { PoolCommands } from "../action";

import "./pool-details.scss";

@Component({
    selector: "bl-pool-details",
    templateUrl: "pool-details.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PoolCommands],
})
export class PoolDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Pool - ${tab}` : "Pool";
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
        public commands: PoolCommands,
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private batchLabs: BatchLabsService,
        private pricingService: PricingService,
        private poolService: PoolService) {

        this.data = this.poolService.view();
        this.data.item.subscribe((pool) => {
            this.pool = pool;
            this.changeDetector.markForCheck();
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
        return this.commands.get(this.poolId);
    }

    @autobind()
    public updateTags(newTags: List<string>) {
        return this.poolService.updateTags(this.pool, newTags).flatMap(() => {
            return this.data.refresh();
        });
    }

    @autobind()
    public openInNewWindow() {
        const link = `ms-batchlabs://route/standalone/pools/${this.pool.id}/graphs?fullscreen=true`;
        const window = this.batchLabs.openNewWindow(link);

        return Observable.fromPromise(window.appReady);
    }

    private _updatePrice() {
        if (!this.pool) {
            this.estimatedCost = "-";
            this.changeDetector.markForCheck();
            return;
        }
        this.pricingService.computePoolPrice(this.pool).subscribe((cost) => {
            if (!cost) {
                this.estimatedCost = "-";
            } else {
                this.estimatedCost = `${cost.unit} ${NumberUtils.pretty(cost.total)}`;
            }
            this.changeDetector.markForCheck();
        });
    }
}
