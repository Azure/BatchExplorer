import { Component, EventEmitter, Output } from "@angular/core";

import { Filter } from "@bl-common/core";
import { AdvancedFilter, StatePickerControl } from "@bl-common/ui/advanced-filter";
import { PoolAllocationState, PoolState } from "app/models";

@Component({
    selector: "bl-pool-advanced-filter",
    templateUrl: "pool-advanced-filter.html",
})
export class PoolAdvancedFilterComponent {

    @Output()
    public change = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            state: new StatePickerControl("State", [
                PoolState.active, PoolState.upgrading, PoolState.deleting,
            ]),
            allocationState: new StatePickerControl("Allocation state", [
                PoolAllocationState.steady, PoolAllocationState.resizing, PoolAllocationState.stopping,
            ]),
        });

        this.advancedFilter.filterChange.subscribe((filter: Filter) => {
            this.change.emit(filter);
        });
    }
}
