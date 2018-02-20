import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Input,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { Filter, FilterBuilder } from "app/utils/filter-builder";
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

    @ContentChild(BrowseLayoutListDirective)
    public listDirective: BrowseLayoutListDirective;
    @ContentChild(BrowseLayoutAdvancedFilterDirective)
    public advancedFilterDirective: BrowseLayoutAdvancedFilterDirective;

    public quickSearchQuery = new FormControl("");
    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();
    public showAdvancedFilter = false;

    constructor(private activatedRoute: ActivatedRoute, private changeDetector: ChangeDetectorRef) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            console.log("GOT hreer");
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop(this.quickSearchField).startswith(query.clearWhitespace());
            }
            console.log("GOT hreer2");
            this._updateFilter();
        });

        this.activatedRoute.queryParams.subscribe((params: any) => {
            if (params.filter) {
                this.toggleFilter(true);
            }
        });
    }

    public ngAfterViewInit() {
        console.log("This adv", this.advancedFilterDirective);
        if (!this.listDirective) {
            throw new Error("BrowseLayout expect an list component to have the directive blBrowseLayoutList");
        }
        setTimeout(() => {
            this.listDirective.component.quicklist = true;
        })
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

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
        this.listDirective.component.filter = this.filter;
    }
}
