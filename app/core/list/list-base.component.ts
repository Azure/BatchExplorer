import { ChangeDetectorRef, Input, Type, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { Filter } from "app/utils/filter-builder";
import { SelectableList } from "./selectable-list";

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

    private _filter: Filter;
    private _quicklist: boolean = false;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }

    public abstract refresh(): Observable<any>;

    public abstract handleFilter(filter: Filter);
}

export function listBaseProvider(callback: () => Type<any>) {
    return {
        provide: ListBaseComponent,
        useExisting: forwardRef(callback),
    };
}
