import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Inject,
    Input,
    forwardRef,
} from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";
import { TableColumnComponent } from "../table-column";
import { TableColumnRef } from "../table-column-manager";
import { TableComponent } from "../table.component";
import { TableHeadCellComponent } from "./table-head-cell";

interface ResizeRef {
    column: TableColumnRef;
    left: number;
}
@Component({
    selector: "bl-thead",
    templateUrl: "table-head.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeadComponent {
    @Input() public columns: TableColumnRef[];

    public dimensions: Observable<number[]>;

    private _columnIndexMap: StringMap<number>;
    private _dimensions = new BehaviorSubject([]);
    private _resizing: ResizeRef;

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent) {
        this.dimensions = this._dimensions.asObservable();
    }

    public getColumnIndex(column: TableColumnComponent) {
        if (!(column.id in this._columnIndexMap)) {
            return -1;
        }
        return this._columnIndexMap[column.id];
    }

    public trackColumn(index, column) {
        return column.name;
    }

    public handleStartResize(column: TableColumnRef, headCell: TableHeadCellComponent) {
        const rect = headCell.elementRef.nativeElement.getBoundingClientRect();
        this._resizing = {
            column,
            left: rect.left,
        };
    }

    @HostListener("document:mousemove", ["$event"])
    public onMousemove(event: MouseEvent) {
        if (this._resizing) {
            this.updateColumnWidth(this._resizing.column, event.clientX - this._resizing.left);
        }
    }

    @HostListener("document:mouseup")
    public stopResizing() {
        this._resizing = null;
    }

    public updateColumnWidth(column: TableColumnRef, columnWidth: number) {
        console.log("Move to ", columnWidth);
        this.table.columnManager.updateColumnWidth(column.name, columnWidth);
    }
}
