import { ChangeDetectorRef, Input, Type, ViewChild, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { FocusSectionComponent } from "app/components/base/focus-section";
import { ListSelection } from "app/core/list";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SelectableList } from "./selectable-list";

export interface ListBaseComponent {
    // Optional methods
    deleteSelection?(selection: ListSelection);

    refresh?(): Observable<any>;

    handleFilter?(filter: Filter);

    onScrollToBottom?();
}

export abstract class ListBaseComponent extends SelectableList {
    @Input() public set quicklist(quicklist: boolean) {
        this._quicklist = quicklist;
        this.changeDetector.markForCheck();
    }
    public get quicklist() { return this._quicklist; }

    @Input() public set filter(filter: Filter) {
        this._filter = filter;
        this.handleFilter(filter);
        this.changeDetector.markForCheck();
    }
    public get filter() { return this._filter; }

    @ViewChild(FocusSectionComponent) public focusSection: FocusSectionComponent;

    private _filter: Filter = FilterBuilder.none();
    private _quicklist: boolean = false;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }
}

export function listBaseProvider(callback: () => Type<any>) {
    return {
        provide: ListBaseComponent,
        useExisting: forwardRef(callback),
    };
}
