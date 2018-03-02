import { Component, EventEmitter, Output } from "@angular/core";

import { Filter } from "@bl-common/core";
import { AdvancedFilter, StatePickerControl } from "@bl-common/ui/advanced-filter";
import { NodeState } from "app/models";

@Component({
    selector: "bl-node-advanced-filter",
    templateUrl: "node-advanced-filter.html",
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
