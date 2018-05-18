import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    HostListener,
    Inject,
    Input,
    forwardRef,
} from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";
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

    @HostBinding("class.resizing")
    public resizing: ResizeRef;

    public dimensions: Observable<number[]>;

    private _dimensions = new BehaviorSubject([]);

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent) {
        this.dimensions = this._dimensions.asObservable();
    }

    public trackColumn(index, column) {
        return column.name;
    }

    public handleStartResize(column: TableColumnRef, headCell: TableHeadCellComponent) {
        const rect = headCell.elementRef.nativeElement.getBoundingClientRect();
        this.resizing = {
            column,
            left: rect.left,
        };
    }

    @HostListener("document:mousemove", ["$event"])
    public onMousemove(event: MouseEvent) {
        if (this.resizing) {
            this.updateColumnWidth(this.resizing.column, event.clientX - this.resizing.left);
        }
    }

    @HostListener("document:mouseup")
    public stopResizing() {
        this.resizing = null;
    }

    public updateColumnWidth(column: TableColumnRef, columnWidth: number) {
        this.table.columnManager.updateColumnWidth(column.name, columnWidth);
    }

    public resetColumnWidth(column: TableColumnRef) {
        this.table.columnManager.resetColumnWidth(column.name);
    }
}
