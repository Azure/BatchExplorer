import { ChangeDetectorRef, Input, ViewChild } from "@angular/core";
import { ListSelection, SelectableList } from "@batch-flask/core";
import { Filter, FilterBuilder } from "@batch-flask/core/filter-builder";
import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { Observable } from "rxjs";
import { AbstractListBase } from "./abstract-list-base";

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

    @Input() public set status(status: LoadingStatus) {
        this._status = status;
        this.changeDetector.markForCheck();
    }
    public get status() { return this._status; }

    @ViewChild(AbstractListBase) public list: AbstractListBase;

    private _filter: Filter = FilterBuilder.none();
    private _status: LoadingStatus = LoadingStatus.Loading;
    private _quicklist: boolean = false;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }
}
