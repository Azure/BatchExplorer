import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
// import { JobCreateBasicDialogComponent } from "../action";

@Component({
    selector: "bex-application-home",
    templateUrl: "application-home.html",
})
export class ApplicationHomeComponent {
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    // public advancedFilter: Filter = FilterBuilder.none();

    constructor(private formBuilder: FormBuilder, private sidebarManager: SidebarManager) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });
    }

    public addApplication() {
        // this.sidebarManager.open("add-basic-job", JobCreateBasicDialogComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        // this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = this.quickFilter;
        // this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
