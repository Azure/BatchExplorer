import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";

import { FilterBuilder } from "app/utils/filter-builder";

/**
 * Wrapper for a list that should be displayed in the detailed area
 * Adds a search box and a refresh button
 */
@Component({
    selector: "bex-entity-details-list",
    templateUrl: "entity-details-list.html",
})
export class EntityDetailsListComponent {
    @Input()
    public refresh: Function;

    @Input()
    public baseLink: any;

    @Input()
    public loadMore: () => Observable<any>;

    @Input()
    public canLoadMore: boolean = true;

    public filter = FilterBuilder.none();
    public searchQuery = new FormControl();

    constructor() {
        this.searchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.filter = FilterBuilder.none();
            } else {
                this.filter = FilterBuilder.prop("id").startswith(query);
            }
        });
    }
}
