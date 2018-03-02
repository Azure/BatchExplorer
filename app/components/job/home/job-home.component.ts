import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import { Filter, FilterBuilder, autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { JobCreateBasicDialogComponent } from "../action";

@Component({
    selector: "bl-job-home",
    templateUrl: "job-home.html",
})
export class JobHomeComponent {
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();

    constructor(formBuilder: FormBuilder, private sidebarManager: SidebarManager) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });
    }

    @autobind()
    public addJob() {
        this.sidebarManager.open("add-job", JobCreateBasicDialogComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
