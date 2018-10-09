import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    HostListener,
    Inject,
    Input,
    QueryList,
    ViewChildren,
    forwardRef,
} from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";
import { TableColumnRef } from "../table-column-manager";
import { TableComponent } from "../table.component";
import { TableHeadCellComponent } from "./table-head-cell";

interface ResizeRef {
    column: TableColumnRef;
    index: number;
    separatorPosition: number;
    initialSizeLeft: number;
    initialSizeRight?: number;
}
@Component({
    selector: "bl-thead",
    templateUrl: "table-head.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeadComponent {
    @Input() public columns: TableColumnRef[];
    @ViewChildren(TableHeadCellComponent) public cells: QueryList<TableHeadCellComponent>;
    @HostBinding("class.resizing")
    public resizing: ResizeRef;

    public dimensions: Observable<number[]>;

    private _dimensions = new BehaviorSubject([]);

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: any) {
        this.dimensions = this._dimensions.asObservable();
    }

    public trackColumn(index, column) {
        return column.name;
    }

    public handleStartResize(event: MouseEvent, column: TableColumnRef, separator: HTMLElement, index: number) {
        if (!this.table.config.resizableColumn) { return; }
        event.preventDefault();
        const rect = separator.getBoundingClientRect();
        this._computeInitialWidths();
        const initialSizeLeft = this.table.columnManager.getColumnWidth(this.columns[index].name);
        const resizeRef: ResizeRef = {
            column,
            index,
            separatorPosition: rect.left,
            initialSizeLeft,
        };

        if (this.columns.length > index) {
            resizeRef.initialSizeRight = this.table.columnManager.getColumnWidth(this.columns[index + 1].name);
        }
        this.resizing = resizeRef;
    }

    @HostListener("document:mousemove", ["$event"])
    public onMousemove(event: MouseEvent) {
        if (!this.resizing) { return; }
        const index = this.resizing.index;
        const delta = event.clientX - this.resizing.separatorPosition;
        this.updateColumnWidth(this.columns[index], this.resizing.initialSizeLeft + delta);

        if (this.resizing.initialSizeRight && this.columns.length > index) {
            this.updateColumnWidth(this.columns[index + 1], this.resizing.initialSizeRight - delta);
        }
    }

    @HostListener("document:mouseup")
    public stopResizing() {
        if (this.resizing) {
            this.resizing = null;
        }
    }

    public updateColumnWidth(column: TableColumnRef, columnWidth: number) {
        this.table.columnManager.updateColumnWidth(column.name, columnWidth);
    }

    public resetAllColumnWidth() {
        this.table.columnManager.resetAllColumnWidth();
    }

    /**
     * Compute pixel width of each column before each resize in case some are still flex.
     */
    private _computeInitialWidths() {
        const widths = {};
        this.cells.forEach((cell) => {
            const width = cell.elementRef.nativeElement.getBoundingClientRect().width;
            widths[cell.column.name] = width;
        });
        this.table.columnManager.updateColumnsWidth(widths);
    }
}
