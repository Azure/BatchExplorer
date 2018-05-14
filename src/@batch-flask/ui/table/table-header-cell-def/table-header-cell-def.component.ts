import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject,
    OnDestroy, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";

import { Subscription } from "rxjs";
import { TableColumnComponent } from "../table-column";
import { SortDirection } from "../table-column-manager";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-header-cell-def",
    templateUrl: "table-header-cell-def.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderCellDefComponent implements AfterViewInit, OnDestroy {
    public SortDirection = SortDirection;

    @ViewChild(TemplateRef) public content: TemplateRef<any>;

    public sortDirection: SortDirection;
    public isSorting: boolean = false;

    private _sub: Subscription;

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        @Inject(forwardRef(() => TableColumnComponent)) public column: TableColumnComponent,
        private changeDetector: ChangeDetectorRef) {

        this._sub = table.columnManager.sorting.subscribe((sortingInfo) => {
            this.isSorting = sortingInfo && sortingInfo.column === this.column.name;
            this.sortDirection = sortingInfo ? sortingInfo.direction : SortDirection.Asc;
            this.changeDetector.markForCheck();
        });

    }

    public ngAfterViewInit() {
        this.column.update();
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

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
