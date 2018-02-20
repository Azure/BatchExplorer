import { ChangeDetectorRef, Input, Type, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { Filter } from "app/utils/filter-builder";

export abstract class ListBaseComponent {
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
    private _quicklist: boolean;

    constructor(protected changeDetector: ChangeDetectorRef) {

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
