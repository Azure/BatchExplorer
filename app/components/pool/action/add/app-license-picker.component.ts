import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { MdCheckboxChange } from "@angular/material";
import { List, Map } from "immutable";
import { Subscription } from "rxjs";

import { TableComponent } from "app/components/base/table";
import { ApplicationLicense } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { AccountService, PricingService, VmSizeService } from "app/services";
// import { StringUtils, prettyBytes } from "app/utils";

// export class VmSizeDecorator {
//     public title: string;
//     public prettyCores: string;
//     public prettyRAM: string;
//     public prettyOSDiskSize: string;
//     public prettyResourceDiskSize: string;
//     public price: number;
//     public prettyPrice: string;

//     constructor(public vmSize: VmSize, prices: Map<string, SpecCost>) {
//         this.title = this.prettyTitle(vmSize.name);
//         this.prettyCores = this.prettyMb(vmSize.numberOfCores);
//         this.prettyRAM = this.prettyMb(vmSize.memoryInMB);
//         this.prettyOSDiskSize = this.prettyMb(vmSize.osDiskSizeInMB);
//         this.prettyResourceDiskSize = this.prettyMb(vmSize.resourceDiskSizeInMB);

//         const price = prices.get(vmSize.name.toLowerCase());
//         if (price) {
//             this.price = price.amount;
//             this.prettyPrice = `${price.currencyCode} ${price.amount.toFixed(2)}`;
//         } else {
//             this.price = -1;
//         }
//     }

//     public prettyMb(megaBytes: number) {
//         return prettyBytes(megaBytes * 1000 * 1000, 0);
//     }

//     public prettyTitle(vmSize: string) {
//         return vmSize.replace(/_/g, " ");
//     }
// }

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-app-license-picker",
    templateUrl: "app-license-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppLicensePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AppLicensePickerComponent), multi: true },
    ],
})
export class AppLicensePickerComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
    @ViewChild("licenseTable")
    public _table: TableComponent;

    public licenses: List<ApplicationLicense> = List([]);

    private _propagateChange: (value: string) => void = null;

    constructor() {
        // private accountService: AccountService,
        // private pricingService: PricingService
    }

    public ngOnInit() {
        // TODO: read from service when it's available.
        this.licenses = List([
            new ApplicationLicense({
                id: "maya",
                description: "Autodesk Maya",
                licenseAgreement: "",
                cost: "50c USD",
            }),
            new ApplicationLicense({
                id: "arnold",
                description: "Autodesk Arnold",
                licenseAgreement: "",
                cost: "2c USD",
            }),
        ]);

        this._table.selectedItemsChange.subscribe((items) => {
            // console.log("this._table.selectedItemsChange :: ", items);
        });

        // this._loadPrices();
    }

    public ngOnChanges(inputs) {
        /** no-op currently */
    }

    public ngOnDestroy() {
        /** no-op currently */
    }

    public writeValue(value: any) {
        console.log("writeValue: ", value);
        /** no-op currently */
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        /** no-op */
    }

    public setCheckState(id: string, event: MdCheckboxChange) {
        console.log(`${id} - ${event.checked}`);
    }

    // public pickSize(size: string) {
    //     console.log("pick size: ", size);
    //     this.pickedSize = size;
    //     if (this._propagateChange) {
    //         setTimeout(() => {
    //             this._propagateChange(size);
    //         });
    //     }
    // }

    // private _sizeMatchPattern(size: VmSize, patterns: string[]) {
    //     for (let pattern of patterns) {
    //         if (StringUtils.matchWildcard(size.name, pattern)) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    // private _loadPrices() {
    //     this.accountService.currentAccount.flatMap((account) => {
    //         const os = this.osType || "linux";
    //         return this.pricingService.getPrices(account.location, os);
    //     }).subscribe((prices: List<SpecCost>) => {
    //         const map: StringMap<SpecCost> = {};
    //         prices.forEach(x => map[x.id] = x);
    //         this.prices = Map(map);
    //     });
    // }
}
