import {
    AfterViewInit, Component, ContentChild,
    ElementRef, EventEmitter, Input, Output, ViewChild,
    animate, state, style, transition, trigger,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { FocusSectionComponent } from "app/components/base/focus-section";
import { SelectableList } from "app/components/base/selectable-list";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { DeletePoolDialogComponent } from "./delete-selected-items-dialog.component";

@Component({
    selector: "bex-list-and-show-layout",
    templateUrl: "list-and-show-layout.html",
    animations: [
        // Slide in from the right
        trigger("slideIn", [
            state("void", style({
                transform: "translateX(100%)",
            })),
            state("*", style({
                transform: "translateX(0)",
            })),
            transition("* => *", animate(200)),
        ]),
    ],
})
export class ListAndShowLayoutComponent implements AfterViewInit {
    @Input()
    public set list(list: SelectableList) {
        this._list = list;
        if (list.refresh) {
            this.refresh = list.refresh;
        }
        list.activatedItemChange.subscribe((x) => {
            this.itemSelected(x);
        });
    }
    public get list() { return this._list; };

    // Refresh function, if the list has a refresh function it will use that one
    @Input()
    public refresh: Function;

    /**
     * Field for the quicksearch.
     * @default id.
     */
    @Input()
    public quickSearchField = "id";

    @Output()
    public listScrolledToBottom = new EventEmitter<any>();

    @ViewChild("quickSearchInput")
    public quickSearchInput: ElementRef;

    @ContentChild(FocusSectionComponent)
    public listFocusSection: FocusSectionComponent;

    public showAdvancedFilter = new BehaviorSubject<boolean>(false);
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();

    private _list: SelectableList;
    constructor(private activatedRoute: ActivatedRoute, private dialog: MdDialog) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop(this.quickSearchField).startswith(query);
            }
            this._updateFilter();
        });

        this.activatedRoute.queryParams.subscribe((params: any) => {
            if (params.filter) {
                this.toggleFilter(true);
            }
        });
    }

    public ngAfterViewInit() {
        // Focus the quick search input when component get created
        this.quickSearchInput.nativeElement.focus();
    }

    public handleKeyPressedInQuickSearch(event: KeyboardEvent) {
        if (event.code === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            this.listFocusSection.focus();
        }
    }

    public toggleFilter(value?: boolean) {
        this.showAdvancedFilter.next(value == null ? !this.showAdvancedFilter.getValue() : value);
    }

    public itemSelected(item: any) {
        // Triggered twice everytime TODO check
        if (item) {
            this.toggleFilter(false);
        } else {
            // this.toggleFilter(true);
        }
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    public deleteSelectedItems() {
        let config = new MdDialogConfig();

        const dialogRef = this.dialog.open(DeletePoolDialogComponent, config);
        dialogRef.componentInstance.items = this.list.selectedItems;
        dialogRef.afterClosed().subscribe((proceed) => {
            if (proceed) {
                this.list.deleteSelected();
                this.list.clearSelection();
            }
        });
    }
    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
