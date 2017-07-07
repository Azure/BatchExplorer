import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "core-decorators";

import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { FileGroupCreateFormComponent } from "../action";

@Component({
    selector: "bl-data-home",
    templateUrl: "data-home.html",
})
export class DataHomeComponent {
    public quickSearchQuery = new FormControl();
    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();

    constructor(private sidebarManager: SidebarManager) {
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
    public addFileGroup() {
        this.sidebarManager.open("add-file-group", FileGroupCreateFormComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = this.quickFilter;
    }
}
