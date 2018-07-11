import { Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { Subscription } from "rxjs";

import { NodeAgentSku, Offer, PoolOsSkus, Resource, Sku } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { AccountService, ComputeService, PoolOsService } from "app/services";
import { ListView } from "app/services/core";

import "./pool-os-picker.scss";

const cloudServiceOsFamilies = [{
    id: "2",
    name: "2008 R2 SP1",
}, {
    id: "3",
    name: "2012",
}, {
    id: "4",
    name: "2012 R2",
}, {
    id: "5",
    name: "2016",
}].reverse(); // Reverse so we have most recent first

export enum CustomImagesState {
    Ready,
    Empty,
    Error,
}

@Component({
    selector: "bl-pool-os-picker",
    templateUrl: "pool-os-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
    ],
})
export class PoolOsPickerComponent implements ControlValueAccessor, OnDestroy {
    public value: PoolOSPickerModel;

    // Shared to the view
    public PoolOsSources = PoolOsSources;
    public cloudServiceOsFamilies = cloudServiceOsFamilies;

    // VM
    public selectedOffer: string;
    public selectedSku: string;
    public selectedNodeAgentId: string;

    // Cloud service
    public selectedFamilyName: string;

    // Container configuration
    public containerConfiguration: FormControl = new FormControl();
    public showContainerConfiguration: boolean = false;

    // Custom images
    public CustomImagesState = CustomImagesState;
    public customImage: FormControl<string> = new FormControl();
    public nodeAgentSku: FormControl<string> = new FormControl();
    public customImages: Resource[] = [];
    public currentCustomImageState: CustomImagesState;
    public customImagesEmptyMsg: string;
    public customImagesErrorMsg: string;
    public nodeAgentSkus: NodeAgentSku[] = [];

    private _propagateChange: (value: PoolOSPickerModel) => void = null;
    private _nodeAgentSkuMap: PoolOsSkus = new PoolOsSkus();
    private _subs: Subscription[] = [];

    constructor(
        private accountService: AccountService,
        private computeService: ComputeService,
        private poolOsService: PoolOsService) {
        this._subs.push(this.poolOsService.nodeAgentSkus.subscribe((result) => {
            this.nodeAgentSkus = result.toArray();
        }));
        this._subs.push(this.poolOsService.offers.subscribe((offers) => {
            this._nodeAgentSkuMap = offers;
        }));
        this._subs.push(this.containerConfiguration.valueChanges.subscribe(this._updateContainerConfiguration));
        this._loadCustomImages();
    }

    public writeValue(value: any) {
        this.value = value;
        this._updateSelection();
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public ngOnDestroy(): void {
        this._subs.forEach(sub => sub.unsubscribe());
    }

    public validate(c: FormControl) {
        const valid = this.value;
        if (!valid || Boolean(valid.source !== PoolOsSources.PaaS && valid.source !== PoolOsSources.IaaS)) {
            return {
                validateOsPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }

        return null;
    }

    public pickContainerOffer(offer: Offer) {
        this.pickOffer(offer);
        this.showContainerConfiguration = true;
    }

    public pickContainerSku(offer: Offer, sku: Sku) {
        this.pickSku(offer, sku);
        this.showContainerConfiguration = true;
    }

    public pickOffer(offer: Offer) {
        this.pickSku(offer, offer.skus.first());
    }

    public pickSku(offer: Offer, sku: Sku) {
        // preventing user clicking pick same sku multiple times
        if (this.selectedOffer === offer.name &&
            this.selectedSku === sku.name &&
            this.selectedNodeAgentId === sku.nodeAgentId) {
            return;
        }
        this.value = {
            source: PoolOsSources.IaaS,
            virtualMachineConfiguration: {
                nodeAgentSKUId: sku.nodeAgentId,
                imageReference: {
                    publisher: offer.publisher,
                    offer: offer.name,
                    sku: sku.name,
                },
            },
            cloudServiceConfiguration: null,
        };

        this._updateSelection();
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
        this.showContainerConfiguration = false;
    }

    public pickCloudService(version = null) {
        const osFamily = version || cloudServiceOsFamilies.first().id;
        this.value = {
            source: PoolOsSources.PaaS,
            cloudServiceConfiguration: {
                osFamily,
            },
            virtualMachineConfiguration: null,
        };

        this._updateSelection();
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
        this.showContainerConfiguration = false;
    }

    public clearContaienrConfiguration() {
        this.containerConfiguration.patchValue(null);
    }

    public get vmOffers() {
        return this._nodeAgentSkuMap.vmOffers;
    }

    public get dataScienceOffers() {
        return this._nodeAgentSkuMap.dataScienceOffers;
    }

    public get renderingOffers() {
        return this._nodeAgentSkuMap.renderingOffers;
    }

    public get dockerOffers() {
        return this._nodeAgentSkuMap.dockerOffers;
    }

    public get hasCustomImage(): boolean {
        return Boolean(this.nodeAgentSku.value && this.customImage.value);
    }

    public get displayContainerConfiguration(): boolean {
        return this.showContainerConfiguration
            && this.value.virtualMachineConfiguration
            && this.value.virtualMachineConfiguration.imageReference
            && !this.value.virtualMachineConfiguration.imageReference.virtualMachineImageId;
    }

    /**
     * Function that determines whether this OS is active or not
     * Two conditions must be satisfied
     * 1, selectedOffer equals current offer name
     * 2, selectedSku is in current offer sku list
     */
    public isOsActive(offer) {
        const hasSku = offer.skus.filter(x => x.name === this.selectedSku).length > 0;
        return offer.name === this.selectedOffer && hasSku;
    }

    public trackOffer(index, offer: Offer) {
        return offer.name;
    }

    public trackResource(index, image: Resource) {
        return image.id;
    }

    public trackNodeAgentSku(index, nodeAgent: NodeAgentSku) {
        return nodeAgent.id;
    }

    private _updateSelection() {
        const vmConfig = this.value && this.value.virtualMachineConfiguration;
        const ref = vmConfig && vmConfig.imageReference;
        this.selectedOffer = ref && ref.offer;
        this.selectedSku = ref && ref.sku;
        this.selectedNodeAgentId = vmConfig && vmConfig.nodeAgentSKUId;

        const csConfig = this.value && this.value.cloudServiceConfiguration;
        const familyId = csConfig && csConfig.osFamily;
        const item = cloudServiceOsFamilies.filter(x => x.id === familyId).first();
        this.selectedFamilyName = item && item.name;

        // Map values to container configuration form
        const containerConfiguration = vmConfig && vmConfig.containerConfiguration;
        const mappedContainerConfiguration = containerConfiguration ? {
            type: containerConfiguration.type,
            containerImageNames: containerConfiguration.containerImageNames.map(x => {
                return { imageName: x };
            }),
            containerRegistries: containerConfiguration.containerRegistries || [],
        } : null;
        this.containerConfiguration.patchValue(mappedContainerConfiguration);

        // Reset custom image dropdown list if other categories are selected
        const customImage = ref && ref.virtualMachineImageId;
        if (!customImage) {
            this.customImage.patchValue(null);
            this.nodeAgentSku.patchValue(null);
        }
    }

    /**
     * Callback function of container configuration form
     * @param value
     */
    @autobind()
    private _updateContainerConfiguration(value) {
        const vmConfig = this.value && this.value.virtualMachineConfiguration;
        if (vmConfig) {
            if (value) {
                const containerRegistries = value.containerRegistries.length > 0 ?
                    value.containerRegistries : undefined;
                vmConfig.containerConfiguration = {
                    type: value.type,
                    containerImageNames: value.containerImageNames.map(x => x.imageName),
                    containerRegistries: containerRegistries,
                };
            } else {
                vmConfig.containerConfiguration = null;
            }
        }
    }

    private _loadCustomImages() {
        this._subs.push(this.accountService.currentAccount.subscribe(account => {
            const subscriptionId = account && account.subscription && account.subscription.subscriptionId;
            const location = account.location;
            if (!subscriptionId || !location) {
                return;
            }
            this._subs.push(
                this.computeService.listCustomImages(subscriptionId, location).subscribe({
                    next: (resources) => {
                        this.customImages = resources;
                        if (resources.length > 0) {
                            this.currentCustomImageState = CustomImagesState.Ready;
                        } else {
                            this.currentCustomImageState = CustomImagesState.Empty;
                            this.customImagesEmptyMsg = `Custom images of subscription '${subscriptionId}'` +
                                ` are not found in location '${location}'.`;
                        }
                    },
                    error: (error) => {
                        this.currentCustomImageState = CustomImagesState.Error;
                        this.customImagesErrorMsg = error ? `${error.code}: ${error.message}`
                            : "Server encountered an error loading custom images, please try again later.";
                    },
                }),
            );
        }));
        this._subs.push(this.customImage.valueChanges.subscribe(this._customImageOnChange));
        this._subs.push(this.nodeAgentSku.valueChanges.subscribe(this._customImageOnChange));
    }

    @autobind()
    private _customImageOnChange() {
        if (!this.hasCustomImage) {
            return;
        }
        this.value = {
            source: PoolOsSources.IaaS,
            virtualMachineConfiguration: {
                nodeAgentSKUId: this.nodeAgentSku.value,
                imageReference: {
                    virtualMachineImageId: this.customImage.value,
                },
            },
            cloudServiceConfiguration: null,
        };
        this._updateSelection();
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
    }
}
