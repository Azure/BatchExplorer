import { Component, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";

import { NodeAgentSku, NodeAgentSkuMap, Offer, Sku } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { NodeService } from "app/services";
import { RxListProxy } from "app/services/core";

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
export class PoolOsPickerComponent implements ControlValueAccessor, OnInit {
    public value: PoolOSPickerModel;

    public accountData: RxListProxy<{}, NodeAgentSku>;

    // Shared to the view
    public PoolOsSources = PoolOsSources;
    public cloudServiceOsFamilies = cloudServiceOsFamilies;

    // VM
    public selectedOffer: string;
    public selectedSku: string;
    public selectedNodeAgentId: string;

    // Cloud service
    public selectedFamilyName: string;

    private _propagateChange: Function = null;
    private _nodeAgentSkuMap: NodeAgentSkuMap = new NodeAgentSkuMap();

    constructor(private formBuilder: FormBuilder, private nodeService: NodeService) {
        this.accountData = this.nodeService.listNodeAgentSkus();
        this.accountData.items.subscribe((result) => {
            this._buildNodeAgentSkuMap(result);
        });
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

    public validate(c: FormControl) {
        const valid = this.value;

        if (!valid || !valid.source) {
            return {
                validateOsPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }

        return null;
    }

    public pickOffer(offer: Offer) {
        this.pickSku(offer, offer.skus.first());
    }

    public pickSku(offer: Offer, sku: Sku) {
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
    }

    public get vmOffers() {
        return this._nodeAgentSkuMap.vmOffers;
    }

    public get dataScienceOffers() {
        return this._nodeAgentSkuMap.dataScienceOffers;
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
    }

    private _buildNodeAgentSkuMap(nodeAgentSkus: any) {
        this._nodeAgentSkuMap = new NodeAgentSkuMap(nodeAgentSkus);
    }
}
