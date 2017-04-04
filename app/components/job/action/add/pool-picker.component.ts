import { Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Pool } from "app/models";
import { PoolService, VmSizeService } from "app/services";
import { RxListProxy } from "app/services/core";
import { PoolUtils } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-pool-picker",
    templateUrl: "pool-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
    ],
})
export class PoolPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    public pickedPool: string;
    public poolsData: RxListProxy<{}, Pool>;
    public pools: List<Pool> = List([]);
    public poolCores: StringMap<number> = {};

    public searchInput = new FormControl();

    private _propagateChange: Function = null;
    private _subs: Subscription[] = [];

    constructor(private poolService: PoolService, private vmSizeService: VmSizeService) {
        this.poolsData = this.poolService.list(this._computeOptions());

        this._subs.push(this.searchInput.valueChanges.debounceTime(400).distinctUntilChanged()
            .subscribe((query: string) => {
                this.poolsData.setOptions(this._computeOptions(query));
                this.poolsData.fetchNext();
            }));

        this._subs.push(Observable.combineLatest(this.poolsData.items, this.vmSizeService.sizes)
            .subscribe(([pools, sizes]) => {
                this.pools = pools;
                const poolCores = {};

                pools.forEach((pool) => {
                    const vmSize = pool.vmSize.toLowerCase();
                    const size = sizes.filter(x => x.name.toLowerCase() === vmSize).first();
                    const core = size ? size.numberOfCores : 1;
                    poolCores[pool.id] = core;
                });

                this.poolCores = poolCores;
            }));
    }

    public ngOnInit() {
        this.poolsData.fetchNext();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(poolInfo: any) {
        this.pickedPool = poolInfo && poolInfo.poolId;
    }

    public validate() {
        return null;
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public pickPool(pool: Pool) {
        this.pickedPool = pool.id;
        if (this._propagateChange) {
            this._propagateChange({ poolId: pool.id });
        }
    }

    public iconForPool(pool: Pool) {
        return PoolUtils.isLinux(pool) ? "linux" : "windows";
    }

    public poolCoreCount(pool: Pool) {
        const cores = this.poolCores[pool.id] || 1;
        return cores * pool.targetDedicated;
    }

    private _computeOptions(query: string = null) {
        let options: any = { maxResults: 20 };
        if (query) {
            options.filter = FilterBuilder.prop("id").startswith(query.clearWhitespace()).toOData();
        }
        return options;
    }
}
