import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
    HostBinding, HostListener, Inject, Input, OnDestroy, OnInit, forwardRef,
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
export class TableHeadCellComponent implements OnInit, OnDestroy {
    public SortDirection = SortDirection;

    @Input() public column: TableColumnRef;
    public width: number | null;

    @HostBinding("class.sortable")
    public get sortable() {
        return this.column.sortable;
    }

    @HostBinding("class.fixed-size")
    public get fixedSize() {
        return this.width;
    }

    @HostBinding("style.flex-basis")
    public get flexBasis() {
        return this.width + "px";
    }

    public sortDirection: SortDirection;

    @HostBinding("class.sorting")
    public isSorting: boolean = false;

    private _subs: Subscription[] = [];

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        public elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef) {

        this._subs.push(table.columnManager.sorting.subscribe((sortingInfo) => {
            this.isSorting = sortingInfo && sortingInfo.column === this.column.name;
            if (this.isSorting) {
                this.sortDirection = sortingInfo.direction;
            } else {
                this.sortDirection = SortDirection.Asc;
            }
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnInit() {
        this.width = this.table.columnManager.getColumnWidth(this.column.name);
        this._subs.push(this.table.columnManager.dimensionsChange.subscribe(() => {
            this.width = this.table.columnManager.getColumnWidth(this.column.name);
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
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
