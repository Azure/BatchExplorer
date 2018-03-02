import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";

import { Filter, FilterBuilder, autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
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
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });
    }

    @autobind()
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
