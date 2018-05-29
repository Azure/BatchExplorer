import { Component, EventEmitter, Output } from "@angular/core";

import { Filter } from "@batch-flask/core";
import { AdvancedFilter, StatePickerControl } from "@batch-flask/ui/advanced-filter";
import { JobState } from "app/models";

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
