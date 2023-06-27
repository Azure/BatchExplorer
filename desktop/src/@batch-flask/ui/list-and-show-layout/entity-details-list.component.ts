import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FilterBuilder } from "@batch-flask/core";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

import "./entity-details-list.scss";

/**
 * Wrapper for a list that should be displayed in the detailed area
 * Adds a search box and a refresh button
 */
@Component({
    selector: "bl-entity-details-list",
    templateUrl: "entity-details-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailsListComponent {
    @Input()
    public refresh: () => Observable<any>;

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

    constructor(changeDetector: ChangeDetectorRef) {
        this.searchQuery.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe((query: string) => {
            if (query === "") {
                this.filter = FilterBuilder.none();
            } else {
                this.filter = FilterBuilder.prop(this.quickSearchField).startswith(query);
            }
            changeDetector.markForCheck();
        });
    }

    public onAdd(event: Event) {
        this.onAddEntity.emit(event);
    }
}
