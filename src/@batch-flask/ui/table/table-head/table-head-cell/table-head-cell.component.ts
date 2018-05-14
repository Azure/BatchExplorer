import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding,
    HostListener, Inject, Input, OnDestroy, forwardRef,
} from "@angular/core";

import { SortDirection, TableColumnRef } from "@batch-flask/ui/table/table-column-manager";
import { TableComponent } from "@batch-flask/ui/table/table.component";
import { Subscription } from "rxjs";
import "./table-head-cell.scss";

@Component({
    selector: "bl-table-head-cell",
    templateUrl: "table-head-cell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeadCellComponent implements OnDestroy {
    public SortDirection = SortDirection;

    @Input() public column: TableColumnRef;

    @HostBinding("class.sortable")
    public get sortable() {
        return this.column.sortable;
    }

    @HostBinding("class.fixed-size")
    public get fixedSize() {
        return this.column.width;
    }

    @HostBinding("style.flex-basis")
    public get flexBasis() {
        return this.column.width + "px";
    }

    public sortDirection: SortDirection;
    public isSorting: boolean = false;

    private _sub: Subscription;

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        private changeDetector: ChangeDetectorRef) {

        this._sub = table.columnManager.sorting.subscribe((sortingInfo) => {
            this.isSorting = sortingInfo && sortingInfo.column === this.column.name;
            this.sortDirection = sortingInfo ? sortingInfo.direction : SortDirection.Asc;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @HostListener("click")
    public onClick() {
        if (!this.column.sortable) {
            return;
        }

        if (this.isSorting) {
            this._invertOrder();
        } else {
            this.table.sort(this.column.name);
        }
    }

    private _invertOrder() {
        let invertedDirection;
        if (this.sortDirection === SortDirection.Desc) {
            invertedDirection = SortDirection.Asc;
        } else {
            invertedDirection = SortDirection.Desc;
        }

        this.table.sort(this.column.name, invertedDirection);
    }
}
