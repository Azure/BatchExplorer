import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnChanges, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { List } from "immutable";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";

import { isNotNullOrUndefined } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui";
import { Offer, Pool } from "app/models";
import { PoolOsService, PoolService, RenderingContainerImageService,
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
export class PoolPickerComponent implements ControlValueAccessor, OnChanges, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public app: RenderApplication;
    @Input() public imageReferenceId: string;
    @Input() public renderEngine: RenderEngine;

    public pickedPool: string;
    public displayedPools: List<Pool> = List([]);
    public filters: FormGroup;
    public offers: any[] = [];

    private _vmSizeCoresMap = new Map<string, number>();
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
        this.filters = formBuilder.group({
            id: "",
            offer: null,
        });

        const containerImageMap = this.renderingContainerImageService.containerImagesAsMap();

        const ciFilteredPools = combineLatest(
            this.poolService.pools,
            this.filters.valueChanges.pipe(startWith(this.filters.value), distinctUntilChanged()),
            this._inputs.pipe(filter(isNotNullOrUndefined)),
            containerImageMap,
        ).pipe(
            takeUntil(this._destroy),
            map(([pools, filters, inputs, containerImages]) => {
                return pools.filter((pool) => {
                    return this._filterPool(pool, filters, inputs, containerImages);
                }).toList();
            }));

        ciFilteredPools.subscribe((pools) => {
                this.displayedPools = pools;
                this.changeDetector.markForCheck();
        });

        combineLatest(
            this.poolOsService.offers,
            ciFilteredPools,
        ).pipe(
            takeUntil(this._destroy),
        ).subscribe(([offers, pools]) => {
            this._updateOffers(offers.allOffers, pools);
            this.changeDetector.markForCheck();
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

        if (inputs.app && inputs.renderEngine && inputs.imageReferenceId) {

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

    private _updateOffers(offers: Offer[], pools: List<Pool>) {
        const offersMap = offers.map((offer) => {
            const count = pools.count(x => this._filterByOffer(x, offer.name));
            return {
                name: offer.name,
                label: `${offer.name} (${count})`,
            };
        });

        const cloudServiceCount = pools.count(x => this._filterByOffer(x, CLOUD_SERVICE_OFFER));
        offersMap.push({
            name: CLOUD_SERVICE_OFFER,
            label: `Windows (Cloud service) (${cloudServiceCount})`,
        });

        this.offers = offersMap;
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
                if (!image) {
                    return false;
                }
                const isMatch = (image.app === inputs.app
                        && image.renderer === inputs.renderEngine
                        && image.imageReferenceId === inputs.imageReferenceId);
                return isMatch;
            }) != null;
    }

    private _upperCaseFirstChar(lower: string) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    }
}
