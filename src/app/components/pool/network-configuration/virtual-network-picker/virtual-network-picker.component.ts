import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { ArmBatchAccount } from "app/models";
import { BatchAccountService, NetworkConfigurationService, Subnet, VirtualNetwork } from "app/services";
import { ArmResourceUtils } from "app/utils";
import { Subscription } from "rxjs";

import "./virtual-network-picker.scss";

@Component({
    selector: "bl-virtual-network-picker",
    templateUrl: "virtual-network-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VirtualNetworkPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => VirtualNetworkPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualNetworkPickerComponent implements ControlValueAccessor, Validator, OnChanges, OnDestroy {
    @Input() public armNetworkOnly: boolean = true;
    public virtualNetworkControl = new FormControl();
    public subnetControl = new FormControl();
    public subnets: Subnet[];
    public subscriptionId: string;
    public location: string;

    private _propagateChange: (value: string) => void = null;
    private _subs: Subscription[] = [];
    private _armVnetSub: Subscription;
    private _classicVnetSub: Subscription;
    private _armVnets: VirtualNetwork[] = [];
    private _classicVnets: VirtualNetwork[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private accountService: BatchAccountService,
        private networkService: NetworkConfigurationService) {

        this._subs.push(this.subnetControl.valueChanges.subscribe((subnetId: string) => {
            if (this._propagateChange) {
                this._propagateChange(subnetId);
            }
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.accountService.currentAccount.subscribe(account => {
            if (!(account instanceof ArmBatchAccount)) { return; }
            this.subscriptionId = account && account.subscription && account.subscription.subscriptionId;
            this.location = account.location;
            if (!this.subscriptionId || !this.location) {
                return;
            }
            this._disposeVnetSubscription();
            this._armVnetSub = this.networkService.listArmVirtualNetworks(this.subscriptionId, this.location)
                .subscribe(value => {
                    this._armVnets = value;
                    this._virtualNetworkOnChange(this.virtualNetworkControl.value);
                    this.changeDetector.markForCheck();
                });

            this._classicVnetSub = this.networkService.listClassicVirtualNetworks(this.subscriptionId, this.location)
                .subscribe(value => {
                    this._classicVnets = value;
                    this._virtualNetworkOnChange(this.virtualNetworkControl.value);
                    this.changeDetector.markForCheck();
                });
        }));
        this._subs.push(this.virtualNetworkControl.valueChanges.subscribe(this._virtualNetworkOnChange));
    }

    public ngOnChanges(changes) {
        if (changes) {
            this.changeDetector.markForCheck();
        }
    }

    public ngOnDestroy() {
        this._subs.forEach(sub => sub.unsubscribe());
        this._disposeVnetSubscription();
    }

    public writeValue(subnetId: string) {
        if (subnetId) {
            this.subnetControl.setValue(subnetId);
            this._setVirtualNetworkValue(subnetId);
        } else {
            this.virtualNetworkControl.setValue(null);
            this.subnetControl.setValue(null);
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate() {
        return null;
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
        if (!this.subnetControl.value) {
            return "-";
        }
        return this.subnetControl.value;
    }

    private _setVirtualNetworkValue(subnetId: string) {
        const descriptor = ArmResourceUtils.getResourceDescriptor(subnetId);
        // Virtual network is not part of request, it's necessary to parse subnet id to get virtual network id
        if (descriptor.subscription && descriptor.resourceGroup) {
            if (descriptor.resourceMap) {
                const subId = descriptor.subscription;
                const rg = descriptor.resourceGroup;
                const providerKey = Object.keys(descriptor.resourceMap)[0];
                const provider = `${providerKey}/${descriptor.resourceMap[providerKey]}`;
                this.virtualNetworkControl.setValue(this._getVirtualNetworkId(subId, rg, provider));
            }
        }
    }

    @autobind()
    private _virtualNetworkOnChange(vnetId: string) {
        let subnets = null;
        if (vnetId && this.virtualNetworks) {
            const selectedVnets = this.virtualNetworks.find(vnet => vnet.id === vnetId);
            if (selectedVnets) {
                subnets = selectedVnets.subnets;
            }
        }
        this.subnets = subnets;
        if (!this.subnetControl.value) {
            const defaultId = (Array.isArray(this.subnets) && this.subnets.length > 0) ? this.subnets[0].id : null;
            this.subnetControl.setValue(defaultId);
        }
        this.changeDetector.markForCheck();
    }

    private _disposeVnetSubscription() {
        if (this._armVnetSub) {
            this._armVnetSub.unsubscribe();
        }
        if (this._classicVnetSub) {
            this._classicVnetSub.unsubscribe();
        }
    }

    private _getVirtualNetworkId(subId: string, rg: string, provider: string) {
        return `/subscriptions/${subId}/resourceGroups/${rg}/providers/${provider}`;
    }
}
