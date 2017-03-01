import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";

import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { ApplicationCreateDialogComponent } from "../action";

@Component({
    selector: "bl-application-home",
    templateUrl: "application-home.html",
})
export class ApplicationHomeComponent {
    public quickSearchQuery = new FormControl();
    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();

    constructor(private sidebarManager: SidebarManager) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            console.log("query: ", query);
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                console.log("FilterBuilder.prop(\"id\").startswith(query);");
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });
    }

    public addApplication() {
        this.sidebarManager.open("add-application", ApplicationCreateDialogComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = this.quickFilter;
    }
}
