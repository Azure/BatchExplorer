import { Component, EventEmitter, Output } from "@angular/core";

import { AdvancedFilter, StatePickerControl } from "app/components/base/advanced-filter";
import { JobState } from "app/models";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bl-job-advanced-filter",
    templateUrl: "job-advanced-filter.html",
})
export class JobAdvancedFilterComponent {

    @Output()
    public change = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            state: new StatePickerControl("State", [
                JobState.active, JobState.completed, JobState.deleting,
                JobState.terminating, JobState.disabled, JobState.disabling,
            ]),
        });

        this.advancedFilter.filterChange.subscribe((filter: Filter) => {
            this.change.emit(filter);
        });
    }
}
