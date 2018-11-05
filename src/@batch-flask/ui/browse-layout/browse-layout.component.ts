import {
    AfterContentInit, ChangeDetectionStrategy,
    ChangeDetectorRef, Component, ContentChild,
    ElementRef, Input, OnChanges, OnInit, ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Filter, FilterBuilder, autobind } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { BrowseLayoutAdvancedFilterDirective } from "./browse-layout-advanced-filter";
import { BrowseLayoutListDirective } from "./browse-layout-list";

import { KeyCode } from "@batch-flask/core/keys";
import "./browse-layout.scss";

export interface BrowseLayoutConfig {
    /**
     * Name of the field the quicksearch is going to build
     * @default id
     */
    quickSearchField?: string;
    /**
     * Field to be used for the key
     * Route param should match this
     * @default id
     */
    keyField?: string;

    mergeFilter?: (quickSearch: Filter, advanced: Filter) => Filter;
}

const defaultConfig: BrowseLayoutConfig = {
    quickSearchField: "id",
    keyField: "id",
};

let idCounter = 0;

@Component({
    selector: "bl-browse-layout",
    templateUrl: "browse-layout.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowseLayoutComponent implements OnInit, AfterContentInit, OnChanges {
    @Input() public id = `bl-browse-layout-${idCounter++}`;
    /**
     * Field for the quicksearch.
     * @default id.
     */
    @Input() public set config(config: BrowseLayoutConfig) {
        this._config = { ...defaultConfig, ...config };
    }
    public get config() { return this._config; }
    @Input() public keyField = "id";

    @ViewChild("advancedFilterContainer")
    public advancedFilterContainer: ElementRef;

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
    public refreshEnabled = false;

    public selection = new ListSelection();

    private _activeItemKey: string = null;
    private _config: BrowseLayoutConfig = defaultConfig;
    private _selectionChangeSub: Subscription;

    constructor(
        activeRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef) {

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

    public ngOnInit() {
        this.quickSearchQuery.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop(this.config.quickSearchField).startswith(query.clearWhitespace());
            }
            this._updateFilter();
        });
    }

    public ngOnChanges(changes) {
        if (changes.config) {
            this._updateFilter();
        }
    }

    public ngAfterContentInit() {
        if (!this.listDirective) {
            throw new Error("BrowseLayout expect an list component to have the directive blBrowseLayoutList");
        }
        const component = this.listDirective.component;
        component.quicklist = !this.showAdvancedFilter;
        component.activeItem = this._activeItemKey;
        this.selection = component.selection;
        this.deleteSelectionIsEnabled = Boolean(component.deleteSelection);
        this.refreshEnabled = Boolean(component.refresh);
        this.changeDetector.markForCheck();
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
        if (event.code === KeyCode.ArrowDown) {
            event.preventDefault();
            event.stopPropagation();
            if (this.listDirective.component.list) {
                this.listDirective.component.list.focus();
            }
        }
    }

    public toggleFilter(value?: boolean) {
        this.showAdvancedFilter = (value === undefined ? !this.showAdvancedFilter : value);
        if (this.listDirective) {
            this.listDirective.component.quicklist = !this.showAdvancedFilter;
        }
        this.changeDetector.markForCheck();

        if (this.showAdvancedFilter) {
            setTimeout(() => {
                const el = this.advancedFilterContainer.nativeElement.querySelectorAll(
                    `[tabindex]:not([tabindex="-1"])`, "input", "textarea", "button", "[href]")[0];
                if (el) {
                    el.focus();
                }
            });
        }
    }

    public listScrolledToBottom() {
        if (this.listDirective.component.onScrollToBottom) {
            this.listDirective.component.onScrollToBottom();
        }
    }

    @autobind()
    public refresh() {
        if (!this.listDirective.component.refresh) { return; }
        return this.listDirective.component.refresh();
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    public updateActiveItem(key: string) {
        this.toggleFilter(false);
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
        this.listDirective.component.deleteSelection(this.selection);
        this.listDirective.component.selection = new ListSelection();
    }

    private _updateFilter() {
        if (this.config.mergeFilter) {
            this.filter = this.config.mergeFilter(this.quickFilter, this.advancedFilter);
        } else {
            this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
        }
        this.listDirective.component.filter = this.filter;
        this.changeDetector.markForCheck();
    }
}
