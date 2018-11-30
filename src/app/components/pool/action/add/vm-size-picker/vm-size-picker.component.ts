import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { LoadingStatus } from "@batch-flask/ui";
import { exists, prettyBytes } from "@batch-flask/utils";
import { VmSize } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { PricingService, VmSizeService } from "app/services";
import { OSPricing } from "app/services/pricing";
import { List } from "immutable";
import { Subject, Subscription } from "rxjs";

import { TableConfig } from "@batch-flask/ui/table";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";
import { VmSizeFilterValue } from "./vm-size-picker-filter.component";
import "./vm-size-picker.scss";

const categoriesDisplayName = {
    all: "All",
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
        this.title = vmSize.name;
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
    public LoadingStatus = LoadingStatus;

    @Input() public osSource: PoolOsSources;

    @Input() public osType: "linux" | "windows";

    public pickedSize: string;
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public categoryNames: string[];
    public filteredCategories: VmSizeDecorator[];
    public prices: OSPricing = null;
    public categoriesDisplayName = categoriesDisplayName;
    public basicInput = new FormControl();

    public tableConfig: TableConfig = {
        sorting: {
            title: (size: VmSizeDecorator) => size.vmSize.name,
            cores: (size: VmSizeDecorator) => size.vmSize.numberOfCores,
            ram: (size: VmSizeDecorator) => size.vmSize.memoryInMB,
            osDisk: (size: VmSizeDecorator) => size.vmSize.osDiskSizeInMB,
            resourceDisk: (size: VmSizeDecorator) => size.vmSize.resourceDiskSizeInMB,
        },
    };

    private _propagateChange: (value: string) => void = null;
    private _categoryRegex: StringMap<string[]>;
    private _vmSizes: List<VmSize> = List([]);
    private _sizeSub: Subscription;
    private _destroy = new Subject();
    private _currentFilter: VmSizeFilterValue = { category: "all" };

    constructor(
        public vmSizeService: VmSizeService,
        private changeDetector: ChangeDetectorRef,
        private pricingService: PricingService) {

        this.basicInput.valueChanges.pipe(
            takeUntil(this._destroy),
            distinctUntilChanged(),
        ).subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnInit() {
        this.vmSizeService.vmSizeCategories.pipe(
            takeUntil(this._destroy),
        ).subscribe((categories) => {
            this._categoryRegex = categories;
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
        this._destroy.next();
        this._destroy.unsubscribe();
    }

    public writeValue(value: string) {
        this.pickedSize = value;
        this.basicInput.setValue(value);
    }

    public registerOnChange(fn: (value: string) => void) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }

    public onFilterChange(filter: VmSizeFilterValue) {
        this._currentFilter = filter;
        this._categorizeSizes();
    }

    public pickSize(size: string) {
        if (size === this.pickedSize) { return; }
        this.pickedSize = size;
        if (this._propagateChange) {
            this._propagateChange(size);
        }
    }

    public trackVmSize(index, size: VmSizeDecorator) {
        return size.vmSize.id;
    }

    private _categorizeSizes() {
        this.loadingStatus = LoadingStatus.Ready;
        if (!this._vmSizes) { return; }
        let vmSizes = this._vmSizes.toArray();
        if (this._currentFilter && this._categoryRegex) {
            if (this._currentFilter.category && (this._currentFilter.category in this._categoryRegex)) {
                vmSizes = vmSizes.filter(vmSize => {
                    return this._filterByCategory(vmSize, this._categoryRegex[this._currentFilter.category]);
                });
            }
            if (this._currentFilter.searchName) {
                vmSizes = vmSizes.filter(vmSize => {
                    return this._filterBySearchName(vmSize, this._currentFilter.searchName);
                });
            }
        }
        this.filteredCategories = vmSizes.map(x => new VmSizeDecorator(x, this.prices));
        this.changeDetector.markForCheck();
    }

    private _filterByCategory(size: VmSize, patterns: string[]) {
        for (const pattern of patterns) {
            if (new RegExp(pattern).test(size.name.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    private _filterBySearchName(size: VmSize, searchName: string) {
        return size.name.toLowerCase().includes(searchName.toLowerCase());
    }

    private _loadPrices() {
        const os = this.osType || "linux";
        return this.pricingService.getPrices(os).subscribe((prices: OSPricing) => {
            this.prices = prices;
            this._categorizeSizes();
        });
    }
}
