import { Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { Subscription } from "rxjs";

import { NodeAgentSku, NodeAgentSkuMap, Offer, Sku } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { NodeService } from "app/services";
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

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-pool-os-picker",
    templateUrl: "pool-os-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
    ],
})
export class PoolOsPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    public value: PoolOSPickerModel;
    public accountData: ListView<NodeAgentSku, {}>;

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

    private _propagateChange: (value: PoolOSPickerModel) => void = null;
    private _nodeAgentSkuMap: NodeAgentSkuMap = new NodeAgentSkuMap();
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder, private nodeService: NodeService) {
        this.accountData = this.nodeService.listNodeAgentSkus();
        this.accountData.items.subscribe((result) => {
            this._buildNodeAgentSkuMap(result);
        });
        this._sub = this.containerConfiguration.valueChanges.subscribe(this._updateContainerConfiguration);
    }

    public ngOnInit() {
        this.accountData.fetchNext();
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
        this._sub.unsubscribe();
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

    private _buildNodeAgentSkuMap(nodeAgentSkus: any) {
        this._nodeAgentSkuMap = new NodeAgentSkuMap(nodeAgentSkus);
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
