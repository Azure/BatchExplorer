import { Component, Input, OnChanges, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { VmSize } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { VmSizeService } from "app/services";
import { StringUtils, prettyBytes } from "app/utils";
import { List } from "immutable";

const categoriesDisplayName = {
    standard: "General purpose",
    compute: "Compute optimized",
    memory: "Memory optimized",
    storage: "Storage optimized",
    gpu: "GPU",
    hpc: "High performance compute",
};

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
    public categories: StringMap<VmSize[]>;

    private _propagateChange: Function = null;
    private _categories: StringMap<string[]> = {};
    private _vmSizes: List<VmSize> = List([]);
    private _sizeSub: Subscription;
    private _categorySub: Subscription;

    constructor(private vmSizeService: VmSizeService) {
    }

    public ngOnInit() {
        this._categorySub = this.vmSizeService.vmSizeCategories.subscribe((categories) => {
            this._categories = categories;
            this._categorizeSizes();
        });
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

    public pickSize(size: VmSize) {
        this.pickedSize = size.name;
        if (this._propagateChange) {
            this._propagateChange(size.name);
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

    public prettyMb(megaBytes: number) {
        return prettyBytes(megaBytes * 1000 * 1000, 0);
    }

    public prettyTitle(vmSize: string) {
        return vmSize.replace(/_/g, " ");
    }

    private _categorizeSizes() {
        let remainingSizes = this._vmSizes.toArray();
        const categories = {};
        for (let category of Object.keys(this._categories)) {
            const { match, remain } = this._getSizeForCategory(remainingSizes, this._categories[category]);
            remainingSizes = remain;
            categories[category] = match;
        }
        categories["Other"] = remainingSizes;
        this.categories = categories;

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
}
