import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import { autobind } from "app/core";
import { Filter, FilterBuilder } from "app/utils/filter-builder";

@Component({
    selector: "bl-job-schedule-home",
    templateUrl: "job-schedule-home.html",
})
export class JobScheduleHomeComponent {
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();

    constructor(formBuilder: FormBuilder) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
