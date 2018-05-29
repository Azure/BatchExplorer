import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { LoadingStatus } from "@batch-flask/ui";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { VmSize } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { PricingService, VmSizeService } from "app/services";
import { OSPricing } from "app/services/pricing";
import { StringUtils, exists, prettyBytes } from "app/utils";

import { TableConfig } from "@batch-flask/ui/table";
import "./vm-size-picker.scss";

const categoriesDisplayName = {
    standard: "General purpose",
    compute: "Compute optimized",
    memory: "Memory optimized",
    storage: "Storage optimized",
    gpu: "GPU",
    hpc: "High performance compute",
};

export class VmSizeDecorator {
    public id: string;
    public title: string;
    public prettyCores: string;
    public prettyRAM: string;
    public prettyOSDiskSize: string;
    public prettyResourceDiskSize: string;
    public price: number;
    public prettyPrice: string;

    constructor(public vmSize: VmSize, prices: OSPricing) {
        this.id = vmSize.id;
        this.title = this.prettyTitle(vmSize.name);
        this.prettyCores = this.prettyMb(vmSize.numberOfCores);
        this.prettyRAM = this.prettyMb(vmSize.memoryInMB);
        this.prettyOSDiskSize = this.prettyMb(vmSize.osDiskSizeInMB);
        this.prettyResourceDiskSize = this.prettyMb(vmSize.resourceDiskSizeInMB);

        const price = prices && prices.getPrice(vmSize.name.toLowerCase());
        if (exists(price)) {
            this.price = price;
            this.prettyPrice = `${"USD"} ${price.toFixed(2)}`;
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

@Component({
    selector: "bl-vm-size-picker",
    templateUrl: "vm-size-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VmSizePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => VmSizePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmSizePickerComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
    @Input() public osSource: PoolOsSources;

    @Input() public osType: "linux" | "windows";

    public pickedSize: string;

    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public categoryNames: string[];
    public categories: StringMap<VmSizeDecorator[]>;
    public prices: OSPricing = null;

    public tableConfig: TableConfig = {
        values: {
            title: (size: VmSizeDecorator) => size.vmSize.name,
            cores: (size: VmSizeDecorator) => size.vmSize.numberOfCores,
            ram: (size: VmSizeDecorator) => size.vmSize.memoryInMB,
            osDisk: (size: VmSizeDecorator) => size.vmSize.osDiskSizeInMB,
            resourceDisk: (size: VmSizeDecorator) => size.vmSize.resourceDiskSizeInMB,
        },
    };

    private _propagateChange: (value: string) => void = null;
    private _categories: StringMap<string[]> = {};
    private _vmSizes: List<VmSize> = List([]);
    private _sizeSub: Subscription;
    private _categorySub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private vmSizeService: VmSizeService,
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
            this.loadingStatus = LoadingStatus.Loading;
            this._sizeSub = sizes.subscribe(x => {
                this._vmSizes = x;
                this._categorizeSizes();
            });
        }

        if (inputs.osType) {
            this._loadPrices();
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
        if (size === this.pickedSize) { return; }
        this.pickedSize = size;
        if (this._propagateChange) {
            this._propagateChange(size);
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

    public trackCategory(index, category: string) {
        return category;
    }

    public trackVmSize(index, size: VmSizeDecorator) {
        return size.vmSize.id;
    }

    private _categorizeSizes() {
        if (!this._vmSizes) { return; }
        this.loadingStatus = LoadingStatus.Ready;
        let remainingSizes = this._vmSizes.toArray();
        const categories = {};
        for (const category of Object.keys(this._categories)) {
            const { match, remain } = this._getSizeForCategory(remainingSizes, this._categories[category]);
            remainingSizes = remain;
            categories[category] = match.map(x => new VmSizeDecorator(x, this.prices));
        }
        categories["Other"] = remainingSizes.map(x => new VmSizeDecorator(x, this.prices));
        this.categories = categories;

        // Move standard to the first position
        const names = ["standard"].concat(Object.keys(categories).filter(x => x !== "standard"));
        this.categoryNames = names.filter(x => categories[x] && categories[x].length > 0);
        this.changeDetector.markForCheck();
    }

    private _getSizeForCategory(sizes: VmSize[], patterns: string[]) {
        const match = [];
        const remain = [];

        for (const size of sizes) {
            if (this._sizeMatchPattern(size, patterns)) {
                match.push(size);
            } else {
                remain.push(size);
            }
        }
        return { match, remain };
    }

    private _sizeMatchPattern(size: VmSize, patterns: string[]) {
        for (const pattern of patterns) {
            if (StringUtils.matchWildcard(size.name, pattern)) {
                return true;
            }
        }
        return false;
    }

    private _loadPrices() {
        const os = this.osType || "linux";
        return this.pricingService.getPrices(os).subscribe((prices: OSPricing) => {
            this.prices = prices;
            this._categorizeSizes();
        });
    }
}
