import { Component, EventEmitter, Output } from "@angular/core";
import { Filter } from "@batch-flask/core";
import {
    AdvancedFilter,
    ListFilterControl,
    ResultPickerControl,
    StatePickerControl,
} from "@batch-flask/ui/advanced-filter";
import { TaskResult, TaskState } from "app/models";
import { ODataFields } from "common/constants";

@Component({
    selector: "bl-task-advanced-filter",
    templateUrl: "task-advanced-filter.html",
})
export class TaskAdvancedFilterComponent {
    @Output() public filterChange = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            [ODataFields.state]: new StatePickerControl("State", [
                TaskState.active, TaskState.completed, TaskState.running, TaskState.preparing,
            ]),
            [ODataFields.result]: new ResultPickerControl("Result", [
                TaskResult.success, TaskResult.failure,
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
