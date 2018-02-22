import { ChangeDetectorRef, EventEmitter, Input, Output, Type, forwardRef } from "@angular/core";
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

    @Input() public set activeItem(activeItem: string) {
        if (activeItem === this._activeItem) { return; }
        console.log("Active item changed", activeItem);
        this._activeItem = activeItem;
        this.activeItemChange.emit(activeItem);
        this.changeDetector.markForCheck();
    }
    public get activeItem() { return this._activeItem; }

    @Output() public activeItemChange = new EventEmitter<string>();

    private _filter: Filter;
    private _quicklist: boolean = false;
    private _activeItem: string;

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
