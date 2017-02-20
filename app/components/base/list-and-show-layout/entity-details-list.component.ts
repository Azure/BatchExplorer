import { Component, EventEmitter, Input, Output } from "@angular/core";
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

    @Input()
    public filterPlaceholder: string;

    @Input()
    public showExpandButton: boolean = true;

    @Input()
    public expandButtonHoverText: string = "Expand";

    @Input()
    public showRefreshButton: boolean = true;

    @Input()
    public showFilterIcon: boolean = true;

    @Input()
    public refreshButtonHoverText: string = "Refresh";

    @Input()
    public showAddButton: boolean = true;

    @Input()
    public addButtonHoverText: string = "Add";

    @Input()
    public enableAdvancedFilter = true;

    @Input()
    public quickSearchField = "id";

    @Output()
    public onAddEntity: EventEmitter<Event> = new EventEmitter<Event>();

    public filter = FilterBuilder.none();
    public searchQuery = new FormControl();

    constructor() {
        this.searchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.filter = FilterBuilder.none();
            } else {
                this.filter = FilterBuilder.prop(this.quickSearchField).startswith(query);
            }
        });
    }

    public onAdd(event: Event) {
        this.onAddEntity.emit(event);
    }
}
