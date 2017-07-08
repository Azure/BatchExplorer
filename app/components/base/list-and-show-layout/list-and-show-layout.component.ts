import {
    AfterViewInit, Component, ContentChild,
    ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild,
    animate, state, style, transition, trigger,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { FocusSectionComponent } from "app/components/base/focus-section";
import { SelectableList } from "app/components/base/selectable-list";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { DeleteSelectedItemsDialogComponent } from "./delete-selected-items-dialog.component";

@Component({
    selector: "bl-list-and-show-layout",
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
            transition("void => *", animate(200)),
        ]),
    ],
})
export class ListAndShowLayoutComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input()
    public set list(list: SelectableList) {
        this._list = list;
        if (list.refresh) {
            this.refresh = list.refresh;
        }
    }
    public get list() { return this._list; }

    // Refresh function, if the list has a refresh function it will use that one
    @Input()
    public refresh: () => Observable<any>;

    /**
     * Field for the quicksearch.
     * @default id.
     */
    @Input()
    public quickSearchField = "id";

    @Input()
    public hiddenFields: string[];

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

    /**
     * If the provided list has implemented delete selected items
     */
    public deleteSelectedIsEnabled = false;
    public selectedItems: string[] = [];

    private _list: SelectableList;
    private _activatedItemSub: Subscription;
    private _selectedItemsSub: Subscription;

    constructor(private activatedRoute: ActivatedRoute, private dialog: MdDialog) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop(this.quickSearchField).startswith(query.clearWhitespace());
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
        if (this.quickSearchInput) {
            this.quickSearchInput.nativeElement.focus();
        }
    }

    public ngOnChanges(inputs) {
        if (inputs.list) {
            this._clearListSubs();
            if (this.list.activatedItemChange) {
                this._activatedItemSub = this.list.activatedItemChange.subscribe((x) => {
                    this._itemActivated(x);
                });
            }

            if (this.list.selectedItemsChange) {
                this._selectedItemsSub = this.list.selectedItemsChange.subscribe((items) => {
                    this.selectedItems = items;
                });
            }

            this.deleteSelectedIsEnabled = Boolean(this.list.deleteSelected);
        }
    }

    public ngOnDestroy() {
        this._clearListSubs();
    }

    /**
     * Get triggered when a key is pressed while focus is in the quick searchbox
     * If it is arrow down it will move the focus down in the list so you can navigate elements there.
     */
    public handleKeyPressedInQuickSearch(event: KeyboardEvent) {
        if (event.code === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            this.listFocusSection.focus();
        }
    }

    public toggleFilter(value?: boolean) {
        this.showAdvancedFilter.next(value === undefined ? !this.showAdvancedFilter.getValue() : value);
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    @autobind()
    public deleteSelectedItems() {
        let config = new MdDialogConfig();

        const dialogRef = this.dialog.open(DeleteSelectedItemsDialogComponent, config);
        dialogRef.componentInstance.items = this.list.selectedItems;
        dialogRef.afterClosed().subscribe((proceed) => {
            if (proceed) {
                this.list.deleteSelected();
                this.list.clearSelection();
            }
        });
    }

    public isFieldHidden(field: string): boolean {
        return this.hiddenFields && this.hiddenFields.indexOf(field) !== -1;
    }

    private _itemActivated(item: any) {
        if (item && item.key) {
            this.toggleFilter(false);
        }
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }

    private _clearListSubs() {
        if (this._activatedItemSub) {
            this._activatedItemSub.unsubscribe();
        }
        if (this._selectedItemsSub) {
            this._selectedItemsSub.unsubscribe();
        }
    }
}
