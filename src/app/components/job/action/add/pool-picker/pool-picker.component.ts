import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { ListView } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui";
import { Offer, Pool, PoolOsSkus } from "app/models";
import { PoolListParams, PoolOsService, PoolService, RenderingContainerImageService,
    VmSizeService } from "app/services";
import { PoolUtils } from "app/utils";
import { distinctUntilChanged } from "rxjs/operators";

import { RenderApplication, RenderEngine } from "app/models/rendering-container-image";
import "./pool-picker.scss";

interface PoolFilters {
    id: string;
    offer: string;
    containerImage: boolean;
}

const CLOUD_SERVICE_OFFER = "cloudservice-windows";

@Component({
    selector: "bl-pool-picker",
    templateUrl: "pool-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
    ],
})
export class PoolPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public app: RenderApplication;
    @Input() public imageReferenceId: string;
    @Input() public renderEngine: RenderEngine;

    public pickedPool: string;
    public poolsData: ListView<Pool, PoolListParams>;
    public displayedPools: List<Pool> = List([]);
    public filters: FormGroup;
    public offers: any[] = [];

    private _vmSizeCoresMap = new Map<string, number>();
    private _pools: List<Pool> = List([]);
    private _offers: Offer[] = [];
    private _propagateChange: (value: any) => void = null;
    private _subs: Subscription[] = [];

    constructor(
        formBuilder: FormBuilder,
        private poolService: PoolService,
        private poolOsService: PoolOsService,
        private vmSizeService: VmSizeService,
        private renderingContainerImageService: RenderingContainerImageService,
        private changeDetector: ChangeDetectorRef) {
        this.poolsData = this.poolService.listView();
        this.filters = formBuilder.group({
            id: "",
            offer: null,
            containerImage: false,
        });
        this._subs.push(this.filters.valueChanges.pipe(distinctUntilChanged()).subscribe((query: PoolFilters) => {
            this._updateDisplayedPools();
        }));

        this._subs.push(this.poolOsService.offers.subscribe((offers: PoolOsSkus) => {
            this._offers = offers.allOffers;
            this._updateOffers();
        }));

        this._subs.push(this.poolsData.items.subscribe((pools) => {
            this._pools = pools;
            this._updateOffers();
            this._updateDisplayedPools();
        }));

        this._subs.push(this.vmSizeService.sizes.subscribe((sizes) => {
            if (!sizes) {return; }
            const vmSizeCoresMap = new Map<string, number>();
            sizes.forEach((size) => {
                vmSizeCoresMap.set(size.id, size.numberOfCores);
            });

            this._vmSizeCoresMap = vmSizeCoresMap;
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnInit() {
        this.poolsData.fetchAll();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this.poolsData.dispose();
    }

    public writeValue(poolInfo: any) {
        this.pickedPool = poolInfo && poolInfo.poolId;
        this.changeDetector.markForCheck();
    }

    public validate() {
        return null;
    }

    public containerImageFilter(): boolean {
        return this.app != null && this.renderEngine != null && this.imageReferenceId != null;
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public pickPool(pool: Pool) {
        this.pickedPool = pool.id;
        if (this._propagateChange) {
            this._propagateChange({ poolId: pool.id });
        }
    }

    public iconForPool(pool: Pool) {
        return PoolUtils.iconForPool(pool);
    }

    public poolCoreCount(pool: Pool) {
        const cores = this._vmSizeCoresMap.get(pool.vmSize) || 1;
        return cores * pool.targetNodes;
    }

    public trackPool(index, pool: Pool) {
        return pool.id;
    }

    public trackOffer(_, offer: Offer) {
        return offer.name;
    }

    public resetFilters() {
        this.filters.setValue({
            id: "",
            offer: null,
        });
    }

    public get appDisplay() {
        return this._upperCaseFirstChar(this.app);
    }

    public get renderEngineDisplay() {
        return this._upperCaseFirstChar(this.renderEngine);
    }

    public get imageReferenceIdDisplay() {
        return this._upperCaseFirstChar(this.imageReferenceId.substring(0, 6));
    }

    private _updateDisplayedPools() {
        this.filters.value.containerImage = this.containerImageFilter();
        const pools = this._pools.filter((pool) => {
            return this._filterPool(pool);
        });
        this.displayedPools = List(pools);
        this.changeDetector.markForCheck();
    }

    private _filterPool(pool: Pool): boolean {
        const filters: PoolFilters = this.filters.value;
        if (filters.id !== "" && !pool.id.toLowerCase().contains(filters.id.toLowerCase())) {
            return false;
        }

        if (filters.offer) {
            if (!this._filterByOffer(pool, filters.offer)) {
                return false;
            }
        }

        if (filters.containerImage) {
            if (!this._filterByContainerImage(pool)) {
                return false;
            }
        }
        return true;
    }

    private _filterByOffer(pool: Pool, offer: string) {
        const filterByPaaS = offer === CLOUD_SERVICE_OFFER;
        const isIaaS = PoolUtils.isIaas(pool);
        if (isIaaS) {
            if (filterByPaaS) { return false; }
            if (pool.virtualMachineConfiguration.imageReference.offer !== offer) { return false; }
        } else {
            if (!filterByPaaS) { return false; }
        }
        return true;
    }

    private _filterByContainerImage(pool: Pool): boolean {
        if (pool.virtualMachineConfiguration == null ||
            pool.virtualMachineConfiguration.containerConfiguration == null) {
            return false;
        }
        return pool.virtualMachineConfiguration.containerConfiguration
            .containerImageNames.find((containerImage) => {
            if (this.renderingContainerImageService.doesContainerImageMatch(
                containerImage, this.app, this.renderEngine, this.imageReferenceId).subscribe(val => val)) {
                    return true;
                }
            return false;
        }) != null;
    }

    private _updateOffers() {
        const offers = this._offers.map((offer) => {
            const count = this._pools.count(x => this._filterByOffer(x, offer.name));
            return {
                name: offer.name,
                label: `${offer.name} (${count})`,
            };
        });

        const cloudServiceCount = this._pools.count(x => this._filterByOffer(x, CLOUD_SERVICE_OFFER));
        offers.push({
            name: CLOUD_SERVICE_OFFER,
            label: `Windows (Cloud service) (${cloudServiceCount})`,
        });

        this.offers = offers;
        this.changeDetector.markForCheck();
    }

    private _upperCaseFirstChar(lower: string) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    }
}
