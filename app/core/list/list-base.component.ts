import { ChangeDetectorRef, Input, Type, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { ListSelection } from "app/core/list";
import { Filter } from "app/utils/filter-builder";
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
        console.log("Set filter?", filter.toOData());
        this._filter = filter;
        this.handleFilter(filter);
        this.changeDetector.markForCheck();
    }
    public get filter() { return this._filter; }

    private _filter: Filter;
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
