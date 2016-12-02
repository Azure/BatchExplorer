import { Component, EventEmitter, Output } from "@angular/core";

import { AdvancedFilter, StatePickerControl } from "app/components/base/advanced-filter";
import { NodeState } from "app/models";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-node-advanced-filter",
    template: require("./node-advanced-filter.html"),
})
export class NodeAdvancedFilterComponent {

    @Output()
    public change = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            state: new StatePickerControl("State", [
                NodeState.idle, NodeState.running, NodeState.creating, NodeState.leavingPool,
                NodeState.rebooting, NodeState.reimaging, NodeState.starting, NodeState.startTaskFailed,
                NodeState.unknown, NodeState.unusable, NodeState.waitingForStartTask,
            ]),
        });

        this.advancedFilter.filterChange.subscribe((filter: Filter) => {
            this.change.emit(filter);
        });
    }
}
