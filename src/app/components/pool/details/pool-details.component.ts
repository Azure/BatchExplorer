import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EntityView, autobind } from "@batch-flask/core";
import { PoolDecorator } from "app/decorators";
import { ImageInformation, Pool } from "app/models";
import { BatchExplorerService, PoolOsService, PoolParams, PoolService, PricingService } from "app/services";
import { NumberUtils, PoolUtils } from "app/utils";
import { List } from "immutable";
import { Subscription, from } from "rxjs";
import { flatMap } from "rxjs/operators";
import { PoolCommands } from "../action";
import { ElectronShell } from "@batch-flask/electron";

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
    public get isImageDeprecated() {
        return this._isImageDeprecated;
    }
    public get selectedImageEndOfLifeDate() {
        return this._selectedImageEndOfLifeDate.toDateString();
    }

    public data: EntityView<Pool, PoolParams>;
    public estimatedCost = "-";

    private _paramsSubscriber: Subscription;
    private _pool: Pool;
    private _isImageDeprecated: boolean;
    private _supportedImages: ImageInformation[];
    private _selectedImageEndOfLifeDate: Date;

    constructor(
        public commands: PoolCommands,
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private poolOsService: PoolOsService,
        private batchExplorer: BatchExplorerService,
        private pricingService: PricingService,
        private poolService: PoolService,
        private electronShell: ElectronShell) {

        this.data = this.poolService.view();
        this.data.item.subscribe((pool) => {
            this.pool = pool;
            this.changeDetector.markForCheck();
            this._updatePrice();
            this._updatePoolDeprecationWarning();
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
        this.poolOsService.supportedImages.subscribe(val => {
            this._supportedImages = val.toArray();
            this._updatePoolDeprecationWarning();
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
        return this.poolService.updateTags(this.pool, newTags).pipe(
            flatMap(() => this.data.refresh()),
        );
    }

    @autobind()
    public openInNewWindow() {
        const link = `ms-batch-explorer://route/standalone/pools/${this.pool.id}/graphs?fullscreen=true`;
        const window = this.batchExplorer.openNewWindow(link);

        return from(window.appReady);
    }

    public openDeprecationLink() {
        const link = PoolUtils.getEndOfLifeHyperlink(this.poolDecorator.poolOs);
        this.electronShell.openExternal(link, {activate: true});
    }

    public openLink(link: string) {
        this.electronShell.openExternal(link, {activate: true});
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

    private _updatePoolDeprecationWarning() {
        this._isImageDeprecated = false;
        if (!this._supportedImages) {
            return;
        }
        for (let i = 0; i < this._supportedImages.length; i++) {
            const selectedImage = this._supportedImages[i];
            if (this.poolDecorator
                && this.poolDecorator.poolOs.includes(selectedImage.imageReference.sku)
                && selectedImage.batchSupportEndOfLife) {
                this._isImageDeprecated = true;
                this._selectedImageEndOfLifeDate = selectedImage.batchSupportEndOfLife;
            }
        }
    }
}
