import { Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Pool } from "app/models";
import { PoolService, VmSizeService } from "app/services";
import { RxListProxy } from "app/services/core";
import { PoolUtils } from "app/utils";

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
    private _propagateChange: Function = null;
    private _sub: Subscription;

    constructor(private poolService: PoolService, private vmSizeService: VmSizeService) {
        this.poolsData = this.poolService.list();
        this._sub = Observable.combineLatest(this.poolsData.items, this.vmSizeService.sizes)
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
            });
    }

    public ngOnInit() {
        this.poolsData.fetchNext();
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: any) {
        this.pickedPool = value;
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
            this._propagateChange(pool.id);
        }
    }

    public iconForPool(pool: Pool) {
        return PoolUtils.isLinux(pool) ? "linux" : "windows";
    }

    public poolCoreCount(pool: Pool) {
        const cores = this.poolCores[pool.id] || 1;
        return cores * pool.targetDedicated;
    }
}
