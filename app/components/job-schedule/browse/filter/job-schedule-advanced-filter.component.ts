import { ChangeDetectionStrategy, Component, EventEmitter, Output } from "@angular/core";

import { Filter } from "@batch-flask/core";
import { AdvancedFilter, StatePickerControl } from "@batch-flask/ui/advanced-filter";
import { JobScheduleState } from "app/models";

@Component({
    selector: "bl-job-schedule-advanced-filter",
    templateUrl: "job-schedule-advanced-filter.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleAdvancedFilterComponent {
    @Output() public change = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            state: new StatePickerControl("State", [
                JobScheduleState.active,
                JobScheduleState.completed,
                JobScheduleState.deleting,
                JobScheduleState.terminating,
                JobScheduleState.disabled,
            ]),
        });

        this.advancedFilter.filterChange.subscribe((filter: Filter) => {
            this.change.emit(filter);
        });
    }
}
