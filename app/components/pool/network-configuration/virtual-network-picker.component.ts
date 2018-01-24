import { Component, EventEmitter, Input, OnDestroy, Output, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { NetworkConfigurationService, Subnet, VirtualNetwork } from "app/services";

@Component({
    selector: "bl-virtual-network-picker",
    templateUrl: "virtual-network-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VirtualNetworkPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => VirtualNetworkPickerComponent), multi: true },
    ],
})
export class VirtualNetworkPickerComponent implements ControlValueAccessor, Validator, OnDestroy {
    @Input() public armNetworkOnly: boolean = true;
    @Output() public subnetIdChanged = new EventEmitter();

    public form: FormGroup;
    public subnets: Subnet[];
    public subscriptionId: string;
    public location: string;

    private _propagateChange: (value: any) => void = null;
    private _subs: Subscription[] = [];
    private _armVnets: VirtualNetwork[];
    private _classicVnets: VirtualNetwork[];

    constructor(public formBuilder: FormBuilder, private networkService: NetworkConfigurationService) {
        this.form = this.formBuilder.group({
            virtualNetwork: [null],
            subnet: [null],
        });

        this._subs.push(this.form.valueChanges.subscribe((value: VirtualNetwork) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        }));
        this._subs.push(this.networkService.getVirtualNetwork().subscribe(value => {
            this._armVnets = value;
        }));

        this._subs.push(this.networkService.getClassicVirtualNetwork().subscribe(value => {
            this._classicVnets = value;
        }));

        this._subs.push(this.networkService.getCurrentAccount().subscribe(value => {
            this.subscriptionId = value.subscriptionId;
            this.location = value.location;
        }));

        this._subs.push(this.form.controls.virtualNetwork.valueChanges.subscribe(value => {
            let subnets = null;
            if (value) {
                const selectedVnets = this.virtualNetworks.find(vnet => vnet.id === value);
                if (selectedVnets) {
                    subnets = selectedVnets.subnets;
                }
            }
            this.subnets = subnets;
            if (this.subnets && this.subnets.length > 0) {
                this.form.controls.subnet.setValue(this.subnets[0].id);
            } else {
                this.form.controls.subnet.setValue(null);
            }
        }));

        this._subs.push(this.form.controls.subnet.valueChanges.subscribe(value => {
            this.subnetIdChanged.emit(value);
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(sub => sub.unsubscribe());
    }

    public writeValue(value: VirtualNetwork) {
        if (value) {
            this.form.patchValue(value);
        } else {
            this.form.reset();
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (valid) {
            return null;
        }
        return {
            virtualNetwork: {
                valid: false,
            },
        };
    }

    public trackVirtualNetwork(index, vnet: VirtualNetwork) {
        return vnet.id;
    }

    public trackSubnet(index, subnet: Subnet) {
        return subnet.id;
    }

    public get virtualNetworks() {
        return this.armNetworkOnly ? this._armVnets : this._armVnets.concat(this._classicVnets);
    }

    public get subnet() {
        if (!this.form.controls.subnet.value) {
            return "-";
        }
        return this.form.controls.subnet.value;
    }
}
