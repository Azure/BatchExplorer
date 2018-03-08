import { ChangeDetectorRef, Input, ViewChild } from "@angular/core";
import { Observable } from "rxjs";

import { Filter, FilterBuilder } from "@batch-flask/core/filter-builder";
import { FocusSectionComponent } from "@batch-flask/ui/focus-section/focus-section.component";
import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { ListSelection } from "./list-selection";
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

    @Input() public set status(status: LoadingStatus) {
        this._status = status;
        this.changeDetector.markForCheck();
    }
    public get status() { return this._status; }

    @ViewChild(FocusSectionComponent) public focusSection: FocusSectionComponent;

    private _filter: Filter = FilterBuilder.none();
    private _status: LoadingStatus = LoadingStatus.Loading;
    private _quicklist: boolean = false;

    constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
    }
}
