import { Component, EventEmitter, Output } from "@angular/core";

import { AdvancedFilter, StatePickerControl } from "app/components/base/advanced-filter";
import { TaskState } from "app/models";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-task-advanced-filter",
    templateUrl: "task-advanced-filter.html",
})
export class TaskAdvancedFilterComponent {
    @Output()
    public change = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            state: new StatePickerControl("State", [
                TaskState.active, TaskState.completed, TaskState.running, TaskState.preparing,
            ]),
        });

        this.advancedFilter.filterChange.subscribe((filter: Filter) => {
            this.change.emit(filter);
        });
    }
}
