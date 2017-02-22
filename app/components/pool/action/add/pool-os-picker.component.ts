import { Component, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";

import { NodeAgentSku } from "app/models";
import { PoolOSPickerModel, PoolOsSources } from "app/models/forms";
import { AccountService } from "app/services";
import { RxListProxy } from "app/services/core";
import { ObjectUtils } from "app/utils";

// tslint:disable:no-forward-ref

const cloudServiceOsFamilies = [{
    id: 2,
    name: "Windows Server 2008 R2 SP1",
}, {
    id: 3,
    name: "Windows Server 2012",
}, {
    id: 4,
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
    private _nodeAgentSkuMap: any = {};

    constructor(private formBuilder: FormBuilder, private accountService: AccountService) {

    }

    public ngOnInit() {
        this.accountData = this.accountService.listNodeAgentSkus({});
        this.accountData.fetchNext(true).subscribe((result) => {
            this._buildNodeAgentSkuMap(result);
        });

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
        return Object.keys(this._nodeAgentSkuMap);
    }

    public get vmOffers() {
        return Object.keys(this._nodeAgentSkuMap[this.selectedPublisher]);
    }

    public get vmSkus() {
        return Object.keys(this._nodeAgentSkuMap[this.selectedPublisher][this.selectedOffer]);
    }

    public get vmNodeAgentId() {
        return this._nodeAgentSkuMap[this.selectedPublisher][this.selectedOffer][this.selectedSku].nodeAgentId;
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
        let map = {};
        for (let sku of nodeAgentSkus.data) {
            for (let imageReference of sku.verifiedImageReferences) {
                if (!map[imageReference.publisher]) {
                    map[imageReference.publisher] = {};
                }

                if (!map[imageReference.publisher][imageReference.offer]) {
                    map[imageReference.publisher][imageReference.offer] = {};
                }

                if (!map[imageReference.publisher][imageReference.offer][imageReference.sku]) {
                    map[imageReference.publisher][imageReference.offer][imageReference.sku] = {
                        nodeAgentId: sku.id,
                        osType: sku.osType,
                    };
                }
            }
        }
        this._nodeAgentSkuMap = map;
    }
}
