import { ChangeDetectorRef, EventEmitter, Input, Output, Type, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { Filter } from "app/utils/filter-builder";
import { ListSelection } from "./list-selection";

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
        this._activeItem = activeItem;
        this.activeItemChange.emit(activeItem);
        this.changeDetector.markForCheck();
    }
    public get activeItem() { return this._activeItem; }

    @Output() public activeItemChange = new EventEmitter<string>();

    @Input() public set selection(selection: ListSelection) {
        if (selection === this._selection) { return; }
        this._selection = selection;
        this.selectionChange.emit(selection);
        this.changeDetector.markForCheck();
    }
    public get selection() { return this._selection; }

    @Output() public selectionChange = new EventEmitter<ListSelection>();

    private _filter: Filter;
    private _quicklist: boolean = false;
    private _activeItem: string;
    private _selection: ListSelection;

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
