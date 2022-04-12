import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, SimpleChanges, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { ArmBatchAccount } from "app/models";
import { BatchAccountService, NetworkConfigurationService, Subnet, VirtualNetwork } from "app/services";
import { ArmResourceUtils } from "app/utils";
import { BehaviorSubject, Subject, combineLatest, forkJoin } from "rxjs";
import { filter, switchMap, takeUntil, tap } from "rxjs/operators";

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

    public virtualNetworkControl = new FormControl<string | null>(null);
    public subnetControl = new FormControl<string | null>(null);
    public subnets: Subnet[] = [];
    public subscriptionId: string;
    public location: string;
    public isArmBatchAccout = true;
    public virtualNetworks: VirtualNetwork[] = [];

    private _propagateChange: (value: string | null) => void = null;
    private _destroy = new Subject();
    private _armNetworkOnly = new BehaviorSubject(true);

    constructor(
        private changeDetector: ChangeDetectorRef,
        private accountService: BatchAccountService,
        private networkService: NetworkConfigurationService) {

        this.subnetControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((subnetId: string | null) => {
            if (this._propagateChange) {
                this._propagateChange(subnetId);
            }
        });

        const networkObs = this.accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            tap((account) => {
                this.isArmBatchAccout = (account instanceof ArmBatchAccount);
                this.changeDetector.markForCheck();
            }),
            filter(() => this.isArmBatchAccout),
            tap((account: ArmBatchAccount) => {
                this.subscriptionId = account.subscriptionId;
                this.location = account.location;
                this.changeDetector.markForCheck();
            }),
            switchMap(() => {
                return forkJoin([
                    this.networkService.listArmVirtualNetworks(this.subscriptionId, this.location),
                    this.networkService.listClassicVirtualNetworks(this.subscriptionId, this.location),
                ]);
            }),
        );

        combineLatest(networkObs, this._armNetworkOnly).subscribe(([[armVNet, classicVNet], armOnly]) => {
            this.virtualNetworks = armOnly ? armVNet : armVNet.concat(classicVNet);

            this._virtualNetworkOnChange(this.virtualNetworkControl.value);
            this.changeDetector.markForCheck();
        });

        this.virtualNetworkControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe(this._virtualNetworkOnChange);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.armNetworkOnly) {
            this._armNetworkOnly.next(this.armNetworkOnly);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public writeValue(subnetId: string | null) {
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

    public trackVirtualNetwork(_, vnet: VirtualNetwork) {
        return vnet.id;
    }

    public trackSubnet(_, subnet: Subnet) {
        return subnet.id;
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
    private _virtualNetworkOnChange(vnetId: string | null) {
        if (!vnetId) {
            this.subnetControl.setValue(null);
            this.subnets = [];
        } else {
            let subnets = [];
            if (this.virtualNetworks) {
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
        }

        this.changeDetector.markForCheck();
    }

    private _getVirtualNetworkId(subId: string, rg: string, provider: string) {
        return `/subscriptions/${subId}/resourceGroups/${rg}/providers/${provider}`;
    }
}
