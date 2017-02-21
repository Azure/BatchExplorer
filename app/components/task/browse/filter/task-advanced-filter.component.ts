import { Component, EventEmitter, Output } from "@angular/core";

import { AdvancedFilter, ListFilterControl, StatePickerControl } from "app/components/base/advanced-filter";
import { TaskState } from "app/models";
import { ODataFields } from "app/utils/constants";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bl-task-advanced-filter",
    templateUrl: "task-advanced-filter.html",
})
export class TaskAdvancedFilterComponent {
    @Output()
    public filterChange = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            [ODataFields.state]: new StatePickerControl("State", [
                TaskState.active, TaskState.completed, TaskState.running, TaskState.preparing,
            ]),
            [ODataFields.taskExitCode]: new ListFilterControl("Exit code", {
                number: true,
                allowRanges: true,
            }),
        });

        this.advancedFilter.filterChange.subscribe((filter: Filter) => {
            this.filterChange.emit(filter);
        });
    }
}
