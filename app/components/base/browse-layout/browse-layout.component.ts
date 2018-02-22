import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Input,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { MatDialog } from "@angular/material";
import { DeleteSelectedItemsDialogComponent } from "app/components/base/list-and-show-layout";
import { autobind } from "app/core";
import { ListSelection } from "app/core/list";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { Subscription } from "rxjs";
import { BrowseLayoutAdvancedFilterDirective } from "./browse-layout-advanced-filter";
import { BrowseLayoutListDirective } from "./browse-layout-list";
import "./browse-layout.scss";

@Component({
    selector: "bl-browse-layout",
    templateUrl: "browse-layout.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowseLayoutComponent implements AfterViewInit {
    /**
     * Field for the quicksearch.
     * @default id.
     */
    @Input() public quickSearchField = "id";
    @Input() public keyField = "id";

    @ContentChild(BrowseLayoutListDirective)
    public listDirective: BrowseLayoutListDirective;
    @ContentChild(BrowseLayoutAdvancedFilterDirective)
    public advancedFilterDirective: BrowseLayoutAdvancedFilterDirective;

    public quickSearchQuery = new FormControl("");
    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();
    public showAdvancedFilter = false;
    public deleteSelectionIsEnabled = false;

    public selection = new ListSelection();

    private _activeItemKey: string = null;
    private _selectionChangeSub: Subscription;

    constructor(activeRoute: ActivatedRoute, private changeDetector: ChangeDetectorRef, private dialog: MatDialog) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop(this.quickSearchField).startswith(query.clearWhitespace());
            }
            this._updateFilter();
        });

        activeRoute.queryParams.subscribe((params: any) => {
            if (params.filter) {
                this.toggleFilter(true);
            }
        });

        activeRoute.url.subscribe((url) => {
            const child = activeRoute.snapshot.firstChild;
            if (child) {
                const params = child.params;
                const key = params[this.keyField];
                if (key) {
                    this.updateActiveItem(key);
                }
            } else {
                this.updateActiveItem(null);
            }
        });
    }

    public ngAfterViewInit() {
        if (!this.listDirective) {
            throw new Error("BrowseLayout expect an list component to have the directive blBrowseLayoutList");
        }
        const component = this.listDirective.component;
        setTimeout(() => {
            component.quicklist = true;
            component.activeItem = this._activeItemKey;
            this.selection = component.selection;
            this.deleteSelectionIsEnabled = Boolean(component.deleteSelection);
        });
        this._selectionChangeSub = this.listDirective.component.selectionChange.subscribe((x) => {
            this.selection = x;
            this.changeDetector.markForCheck();
        });
    }

    public _ngOnDestroy() {
        if (this._selectionChangeSub) {
            this._selectionChangeSub.unsubscribe();
        }
    }

    /**
     * Get triggered when a key is pressed while focus is in the quick searchbox
     * If it is arrow down it will move the focus down in the list so you can navigate elements there.
     */
    public handleKeyPressedInQuickSearch(event: KeyboardEvent) {
        if (event.code === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            // TODO-TIM check that
            // this.listFocusSection.focus();
        }
    }

    public toggleFilter(value?: boolean) {
        this.showAdvancedFilter = (value === undefined ? !this.showAdvancedFilter : value);
        this.listDirective.component.quicklist = !this.showAdvancedFilter;
        this.changeDetector.markForCheck();
    }

    public listScrolledToBottom() {
        // console.log("TODO");
        // TODO-TIM
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    public updateActiveItem(key: string) {
        this._activeItemKey = key;
        if (this.listDirective) {
            this.listDirective.component.activeItem = key;
        }
    }

    /**
     * Show a dialog promping the user for confirmation then callback to the list for deleting
     */
    @autobind()
    public deleteSelection() {
        const dialogRef = this.dialog.open(DeleteSelectedItemsDialogComponent);
        dialogRef.componentInstance.items = [...this.selection.keys];
        dialogRef.afterClosed().subscribe((proceed) => {
            if (proceed) {
                this.listDirective.component.deleteSelection(this.selection);
                this.listDirective.component.selection = new ListSelection();
            }
        });
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
        this.listDirective.component.filter = this.filter;
    }
}
