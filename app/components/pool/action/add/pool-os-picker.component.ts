import { Component, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";

import { NodeAgentSku, NodeAgentSkuMap } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { NodeService } from "app/services";
import { RxListProxy } from "app/services/core";
import { ObjectUtils } from "app/utils";

// tslint:disable:no-forward-ref

const cloudServiceOsFamilies = [{
    id: "2",
    name: "Windows Server 2008 R2 SP1",
}, {
    id: "3",
    name: "Windows Server 2012",
}, {
    id: "4",
    name: "Windows Server 2012 R2",
}].reverse(); // Reverse so we have most recent first

@Component({
    selector: "bl-pool-os-picker",
    templateUrl: "pool-os-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolOsPickerComponent), multi: true },
    ],
})
export class PoolOsPickerComponent implements ControlValueAccessor, OnInit {
    public form: FormGroup;
    public cloudServiceConfigurationGroup: FormGroup;
    public virtualMachineConfigurationGroup: FormGroup;

    public source: FormControl;
    public publisher: FormControl;
    public offer: FormControl;
    public sku: FormControl;
    public nodeAgentSKUId: FormControl;
    public accountData: RxListProxy<{}, NodeAgentSku>;

    public selectedSource = PoolOsSources.IaaS;
    public selectedPublisher: string = null;
    public selectedOffer: string = null;
    public selectedSku: string = null;

    // Shared to the view
    public PoolOsSources = PoolOsSources;
    public cloudServiceOsFamilies = cloudServiceOsFamilies;

    private _propagateChange: Function = null;
    private _nodeAgentSkuMap: NodeAgentSkuMap = new NodeAgentSkuMap();

    constructor(private formBuilder: FormBuilder, private nodeService: NodeService) {
        console.log("pOolOSPCIk", this.nodeService);
        this.accountData = this.nodeService.listNodeAgentSkus();
        this.accountData.items.subscribe((result) => {
            this._buildNodeAgentSkuMap(result);
        });
        this.accountData.fetchNext();
    }

    public ngOnInit() {
        this.source = this.formBuilder.control(this.selectedSource, Validators.required);
        this.publisher = this.formBuilder.control("", Validators.required);
        this.offer = this.formBuilder.control("", Validators.required);
        this.sku = this.formBuilder.control("", Validators.required);
        this.nodeAgentSKUId = this.formBuilder.control("", Validators.required);

        this.cloudServiceConfigurationGroup = this.formBuilder.group({
            osFamily: ["", Validators.required],
        });
        this.virtualMachineConfigurationGroup = this.formBuilder.group({
            nodeAgentSKUId: this.nodeAgentSKUId,
            imageReference: this.formBuilder.group({
                publisher: this.publisher,
                offer: this.offer,
                sku: this.sku,
            }),
        });
        this.form = this.formBuilder.group({
            source: this.source,
            cloudServiceConfiguration: this.cloudServiceConfigurationGroup,
            virtualMachineConfiguration: this.virtualMachineConfigurationGroup,
        });
        this.form.valueChanges.subscribe((val: PoolOSPickerModel) => {
            if (this._propagateChange) {
                this._propagateChange(val);
            }
        });

        this._setupEvent();
    }

    public writeValue(value: any) {
        this.form.patchValue(ObjectUtils.compact(value));
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.selectedSource === PoolOsSources.PaaS
            ? this.cloudServiceConfigurationGroup.valid
            : this.virtualMachineConfigurationGroup.valid;

        if (!valid) {
            return {
                validateOsPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }

        return null;
    }

    public get vmPublishers() {
        return this._nodeAgentSkuMap.getPublishers();
    }

    public get vmOffers() {
        return this._nodeAgentSkuMap.getOffers(this.selectedPublisher);
    }

    public get vmSkus() {
        return this._nodeAgentSkuMap.getSkus(this.selectedPublisher, this.selectedOffer);
    }

    public get vmNodeAgentId() {
        return this._nodeAgentSkuMap.getNodeAgentId(this.selectedPublisher, this.selectedOffer, this.selectedSku);
    }

    private _setupEvent() {
        this.source.valueChanges.subscribe((value) => {
            this.selectedSource = Number(value);
        });
        this.publisher.valueChanges.subscribe((value) => {
            this.selectedPublisher = value;
            this.offer.patchValue(null);
        });
        this.offer.valueChanges.subscribe((value) => {
            this.selectedOffer = value;
            this.sku.patchValue(null);
        });
        this.sku.valueChanges.subscribe((value) => {
            this.selectedSku = value;
            this.nodeAgentSKUId.patchValue(value && this.vmNodeAgentId);
        });
    }

    private _buildNodeAgentSkuMap(nodeAgentSkus: any) {
        this._nodeAgentSkuMap = new NodeAgentSkuMap(nodeAgentSkus);
    }
}
