import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnChanges, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { List } from "immutable";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";

import { ListView, isNotNullOrUndefined } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui";
import { Offer, Pool, PoolOsSkus } from "app/models";
import { PoolListParams, PoolOsService, PoolService, RenderingContainerImageService,
    VmSizeService } from "app/services";
import { PoolUtils } from "app/utils";
import { distinctUntilChanged, filter, map, startWith, takeUntil } from "rxjs/operators";

import { RenderApplication, RenderEngine, RenderingContainerImage } from "app/models/rendering-container-image";
import "./pool-picker.scss";

interface PoolFilters {
    id: string;
    offer: string;
    containerImage: boolean;
}

interface Inputs {
    app: RenderApplication;
    renderEngine: RenderEngine;
    imageReferenceId: string;
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
export class PoolPickerComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
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
    private _destroy = new Subject();
    private _inputs = new BehaviorSubject<Inputs>(null);

    constructor(
        formBuilder: FormBuilder,
        private poolService: PoolService,
        private poolOsService: PoolOsService,
        private vmSizeService: VmSizeService,
        private renderingContainerImageService: RenderingContainerImageService,
        private changeDetector: ChangeDetectorRef) {
        this.poolsData = this.poolService.listView;
        this.filters = formBuilder.group({
            id: "",
            offer: null,
        });

        const containerImageMap = this.renderingContainerImageService.containerImagesAsMap();

        combineLatest(
            this.poolsData.items,
            this.filters.valueChanges.pipe(startWith(this.filters.value), distinctUntilChanged()),
            this._inputs.pipe(filter(isNotNullOrUndefined)),
            containerImageMap,
        ).pipe(
            takeUntil(this._destroy),
            map(([pools, filters, inputs, containerImages]) => {
                return pools.filter((pool) => {
                    return this._filterPool(pool, filters, inputs, containerImages);
                });
            }),
            ).subscribe((pools) => {
                this.displayedPools = List<Pool>(pools);
                this.changeDetector.markForCheck();
        });

        this.poolOsService.offers.pipe(takeUntil(this._destroy)).subscribe((offers: PoolOsSkus) => {
            this._offers = offers.allOffers;
            this._updateOffers();
        });

        this.vmSizeService.sizes.pipe(takeUntil(this._destroy)).subscribe((sizes) => {
            if (!sizes) {return; }
            const vmSizeCoresMap = new Map<string, number>();
            sizes.forEach((size) => {
                vmSizeCoresMap.set(size.id, size.numberOfCores);
            });

            this._vmSizeCoresMap = vmSizeCoresMap;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.app && changes.renderEngine && changes.imageReferenceId) {
            this._inputs.next(
                {app: this.app, renderEngine: this.renderEngine, imageReferenceId: this.imageReferenceId});
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public writeValue(poolInfo: any) {
        this.pickedPool = poolInfo && poolInfo.poolId;
        this.changeDetector.markForCheck();
    }

    public validate() {
        return null;
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

    private _filterPool(pool: Pool, filters: PoolFilters, inputs: Inputs,
                        containerImages: Map <string, RenderingContainerImage>): boolean {
        if (filters.id !== "" && !pool.id.toLowerCase().contains(filters.id.toLowerCase())) {
            return false;
        }

        if (filters.offer) {
            if (!this._filterByOffer(pool, filters.offer)) {
                return false;
            }
        }


        if (inputs.app && inputs.renderEngine && inputs.imageReferenceId) { // TODO can we use filters.containerImage instead? Wired up through the html / onChanges?
            if (!this._filterByContainerImage(pool, inputs, containerImages)) {
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

    private _filterByContainerImage(pool: Pool, inputs: Inputs,
                                    containerImages: Map <string, RenderingContainerImage>) {
        if (!pool.virtualMachineConfiguration ||
            !pool.virtualMachineConfiguration.containerConfiguration) {
            return false;
        }
        return pool.virtualMachineConfiguration.containerConfiguration.containerImageNames
            .find(imageId => {
                const image = containerImages.get(imageId);
                if (image === null) {
                    return false;
                }
                return image.app === inputs.app &&
                        image.renderer === inputs.renderEngine &&
                        image.imageReferenceId === inputs.imageReferenceId;
            }) != null;
    }

    private _upperCaseFirstChar(lower: string) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    }
}
