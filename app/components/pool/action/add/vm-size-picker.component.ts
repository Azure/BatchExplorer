import { Component, Input, OnChanges, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Map, List } from "immutable";
import { Subscription } from "rxjs";

import { SpecCost, VmSize } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { AccountService, PricingService, VmSizeService } from "app/services";
import { StringUtils, prettyBytes } from "app/utils";

const categoriesDisplayName = {
    standard: "General purpose",
    compute: "Compute optimized",
    memory: "Memory optimized",
    storage: "Storage optimized",
    gpu: "GPU",
    hpc: "High performance compute",
};

export class VmSizeDecorator {
    public title: string;
    public prettyCores: string;
    public prettyRAM: string;
    public prettyOSDiskSize: string;
    public prettyResourceDiskSize: string;
    public price: number;
    public prettyPrice: string;

    constructor(public vmSize: VmSize, prices: Map<string, SpecCost>) {
        this.title = this.prettyTitle(vmSize.name);
        this.prettyCores = this.prettyMb(vmSize.numberOfCores);
        this.prettyRAM = this.prettyMb(vmSize.memoryInMB);
        this.prettyOSDiskSize = this.prettyMb(vmSize.osDiskSizeInMB);
        this.prettyResourceDiskSize = this.prettyMb(vmSize.resourceDiskSizeInMB);

        const price = prices.get(vmSize.name.toLowerCase());
        if (price) {
            this.price = price.amount;
            this.prettyPrice = `${price.currencyCode} ${price.amount.toFixed(2)}`;
        } else {
            this.price = -1;
        }
    }

    public prettyMb(megaBytes: number) {
        return prettyBytes(megaBytes * 1000 * 1000, 0);
    }

    public prettyTitle(vmSize: string) {
        return vmSize.replace(/_/g, " ");
    }
}

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-vm-size-picker",
    templateUrl: "vm-size-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VmSizePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => VmSizePickerComponent), multi: true },
    ],
})
export class VmSizePickerComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
    @Input()
    public osSource: PoolOsSources;
    public pickedSize: string;

    public categoryNames: string[];
    public categories: StringMap<VmSizeDecorator[]>;
    public prices: Map<string, SpecCost> = Map<string, SpecCost>({});

    private _propagateChange: Function = null;
    private _categories: StringMap<string[]> = {};
    private _vmSizes: List<VmSize> = List([]);
    private _sizeSub: Subscription;
    private _categorySub: Subscription;

    constructor(
        private vmSizeService: VmSizeService,
        private accountService: AccountService,
        private pricingService: PricingService) {
    }

    public ngOnInit() {
        this._categorySub = this.vmSizeService.vmSizeCategories.subscribe((categories) => {
            this._categories = categories;
            this._categorizeSizes();
        });
        this._loadPrices();
    }

    public ngOnChanges(inputs) {
        if (inputs.osSource) {
            if (this._sizeSub) {
                this._sizeSub.unsubscribe();
            }
            let sizes;
            if (this.osSource === PoolOsSources.IaaS) {
                sizes = this.vmSizeService.virtualMachineSizes;
            } else {
                sizes = this.vmSizeService.cloudServiceSizes;
            }
            this._sizeSub = sizes.subscribe(x => {
                this._vmSizes = x;
                this._categorizeSizes();
            });
        }
    }

    public ngOnDestroy() {
        if (this._sizeSub) {
            this._sizeSub.unsubscribe();
        }
        this._categorySub.unsubscribe();
    }

    public writeValue(value: any) {
        this.pickedSize = value;
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }

    public pickSize(size: string) {
        this.pickedSize = size;
        if (this._propagateChange) {
            setTimeout(() => {
                this._propagateChange(size);
            });
        }
    }

    public categoryLabelName(categoryName: string) {
        let count = 0;
        let name = categoryName;
        if (categoryName in this.categories) {
            count = this.categories[categoryName].length;
        }
        if (categoryName in categoriesDisplayName) {
            name = categoriesDisplayName[categoryName];
        }
        return `${name} (${count})`;
    }

    private _categorizeSizes() {
        let remainingSizes = this._vmSizes.toArray();
        const categories = {};
        for (let category of Object.keys(this._categories)) {
            const { match, remain } = this._getSizeForCategory(remainingSizes, this._categories[category]);
            remainingSizes = remain;
            categories[category] = match.map(x => new VmSizeDecorator(x, this.prices));
        }
        categories["Other"] = remainingSizes.map(x => new VmSizeDecorator(x, this.prices));
        this.categories = categories;
        console.log("Categories", categories);

        // Move standard to the first position
        const names = ["standard"].concat(Object.keys(categories).filter(x => x !== "standard"));
        this.categoryNames = names.filter(x => categories[x] && categories[x].length > 0);
    }

    private _getSizeForCategory(sizes: VmSize[], patterns: string[]) {
        const match = [];
        const remain = [];

        for (let size of sizes) {
            if (this._sizeMatchPattern(size, patterns)) {
                match.push(size);
            } else {
                remain.push(size);
            }
        }
        return { match, remain };
    }

    private _sizeMatchPattern(size: VmSize, patterns: string[]) {
        for (let pattern of patterns) {
            if (StringUtils.matchWildcard(size.name, pattern)) {
                return true;
            }
        }
        return false;
    }

    private _loadPrices() {
        this.accountService.currentAccount.flatMap((account) => {
            const os = "linux"; // TODO update this.
            return this.pricingService.getPrices(account.location, os);
        }).subscribe((prices: List<SpecCost>) => {
            const map: StringMap<SpecCost> = {};
            prices.forEach(x => map[x.id] = x);
            this.prices = Map(map);
            this._categorizeSizes();
        });
    }
}
