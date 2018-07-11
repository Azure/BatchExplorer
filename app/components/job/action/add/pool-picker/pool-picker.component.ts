import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { FilterBuilder } from "@batch-flask/core";
import { Pool } from "app/models";
import { PoolListParams, PoolService, VmSizeService } from "app/services";
import { ListOptionsAttributes, ListView } from "app/services/core";
import { PoolUtils } from "app/utils";

import "./pool-picker.scss";

@Component({
    selector: "bl-pool-picker",
    templateUrl: "pool-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
    ],
})
export class PoolPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    public pickedPool: string;
    public poolsData: ListView<Pool, PoolListParams>;
    public pools: List<Pool> = List([]);
    public poolCores = new Map<string, number>();

    public searchInput = new FormControl();

    private _propagateChange: (value: any) => void = null;
    private _subs: Subscription[] = [];

    constructor(
        private poolService: PoolService,
        private vmSizeService: VmSizeService,
        private changeDetector: ChangeDetectorRef) {
        this.poolsData = this.poolService.listView(this._computeOptions());

        this._subs.push(this.searchInput.valueChanges.debounceTime(400).distinctUntilChanged()
            .subscribe((query: string) => {

            }));

        this._subs.push(Observable.combineLatest(this.poolsData.items, this.vmSizeService.sizes)
            .subscribe(([pools, sizes]) => {
                this.pools = pools;
                const poolCores = new Map<string, number>();

                pools.forEach((pool) => {
                    const vmSize = pool.vmSize.toLowerCase();
                    const size = sizes.filter(x => x.name.toLowerCase() === vmSize).first();
                    const core = size ? size.numberOfCores : 1;
                    poolCores.set(pool.id, core);
                });

                this.poolCores = poolCores;
                this.changeDetector.markForCheck();
            }));
    }

    public ngOnInit() {
        this.poolsData.fetchAll();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this.poolsData.dispose();
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
        return PoolUtils.iconForPool(pool);
    }

    public poolCoreCount(pool: Pool) {
        const cores = this.poolCores.get(pool.id) || 1;
        return cores * pool.targetNodes;
    }

    public trackPool(index, pool: Pool) {
        return pool.id;
    }

    private _computeOptions(query: string = null) {
        const options: ListOptionsAttributes = { maxItems: 20 };
        if (query) {
            options.filter = FilterBuilder.prop("id").startswith(query.clearWhitespace());
        }
        return options;
    }
}
