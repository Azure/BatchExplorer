import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { NodeAgentSku, Offer, PoolOsSkus, Resource, Sku } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { PoolOsService } from "app/services";
import { Subscription } from "rxjs";
import { CustomImageSelection } from "./custom-image-picker";

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

@Component({
    selector: "bl-pool-os-picker",
    templateUrl: "pool-os-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolOsPickerComponent implements ControlValueAccessor, OnDestroy {

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

    public get customImage(): CustomImageSelection {
        if (this.value.source === PoolOsSources.PaaS) {
            return null;
        }
        const config = this.value.virtualMachineConfiguration;
        const ref = config && config.imageReference;
        if (ref && ref.virtualMachineImageId) {
            return {
                imageId: ref.virtualMachineImageId,
                nodeAgentSku: config.nodeAgentSKUId,
            };
        } else {
            return null;
        }
    }

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
    private _nodeAgentSkuMap: PoolOsSkus = new PoolOsSkus();
    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private poolOsService: PoolOsService) {
        this._subs.push(this.poolOsService.offers.subscribe((offers) => {
            this._nodeAgentSkuMap = offers;
        }));
        this._subs.push(this.containerConfiguration.valueChanges.subscribe(this._updateContainerConfiguration));
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
        this.pickSku(offer, offer.skus.last());
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
        this._propagateChange(this.value);
        this.showContainerConfiguration = false;
        this.changeDetector.markForCheck();
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

        this.showContainerConfiguration = false;
        this._updateSelection();
        this._propagateChange(this.value);
        this.changeDetector.markForCheck();
    }

    public pickCustomImage(result: CustomImageSelection | null) {
        if (!result) {
            return;
        }
        this.value = {
            source: PoolOsSources.IaaS,
            cloudServiceConfiguration: null,
            virtualMachineConfiguration: {
                imageReference: {
                    virtualMachineImageId: result.imageId,
                },
                nodeAgentSKUId: result.nodeAgentSku,
            },
        };
        this.showContainerConfiguration = true;
        this._updateSelection();
        this._propagateChange(this.value);
        this.changeDetector.markForCheck();
    }

    public clearContaienrConfiguration() {
        this.containerConfiguration.patchValue(null);
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

    public trackOffer(_, offer: Offer) {
        return offer.name;
    }

    public trackResource(_, image: Resource) {
        return image.id;
    }

    public trackNodeAgentSku(_, nodeAgent: NodeAgentSku) {
        return nodeAgent.id;
    }

    private _propagateChange: (value: PoolOSPickerModel) => void = () => null;

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
}
